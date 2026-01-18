/**
 * Request validation utilities
 */

import { ValidationError } from './errors';

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validate request body against schema
 */
export function validateRequest(
  data: any,
  schema: ValidationSchema
): { isValid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];

    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip other validations if field is optional and not provided
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type check
    if (rule.type) {
      const typeCheck = checkType(value, rule.type);
      if (!typeCheck.valid) {
        errors[field] = typeCheck.error || `${field} must be of type ${rule.type}`;
        continue;
      }
    }

    // String validations
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.min !== undefined && value.length < rule.min) {
        errors[field] = `${field} must be at least ${rule.min} characters`;
        continue;
      }
      if (rule.max !== undefined && value.length > rule.max) {
        errors[field] = `${field} must be at most ${rule.max} characters`;
        continue;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = `${field} format is invalid`;
        continue;
      }
    }

    // Number validations
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors[field] = `${field} must be at least ${rule.min}`;
        continue;
      }
      if (rule.max !== undefined && value > rule.max) {
        errors[field] = `${field} must be at most ${rule.max}`;
        continue;
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        errors[field] = typeof customResult === 'string' ? customResult : `${field} is invalid`;
        continue;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

function checkType(value: any, expectedType: string): { valid: boolean; error?: string } {
  switch (expectedType) {
    case 'string':
      return { valid: typeof value === 'string' };
    case 'number':
      return { valid: typeof value === 'number' && !isNaN(value) };
    case 'boolean':
      return { valid: typeof value === 'boolean' };
    case 'object':
      return { valid: typeof value === 'object' && value !== null && !Array.isArray(value) };
    case 'array':
      return { valid: Array.isArray(value) };
    default:
      return { valid: false, error: `Unknown type: ${expectedType}` };
  }
}
