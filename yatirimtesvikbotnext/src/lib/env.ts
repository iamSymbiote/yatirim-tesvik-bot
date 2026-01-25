/**
 * Type-safe environment variables
 * Bu dosya, environment variable'ları type-safe bir şekilde yönetir
 */

// Runtime'da kontrol edilecek environment variables
const requiredEnvVars = {
  // PAYTR için (production'da zorunlu olacak)
  PAYTR_MERCHANT_ID: process.env.PAYTR_MERCHANT_ID,
  PAYTR_MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY,
  PAYTR_MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT,

  // AI API için (ileride eklenecek)
  // AI_API_URL: process.env.AI_API_URL,
  // AI_API_KEY: process.env.AI_API_KEY,
} as const;

// Optional environment variables
const optionalEnvVars = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

/**
 * Environment variables'ı validate et
 * Production'da eksik required env var varsa hata fırlatır
 */
export function validateEnv() {
  if (process.env.NODE_ENV === 'production') {
    const missing: string[] = [];
    
    Object.entries(requiredEnvVars).forEach(([key, value]) => {
      if (!value) {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }
  }
}

/**
 * Type-safe environment variable getter
 */
export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
} as const;

// Development'ta env uyarıları console'a yazılmaz (güvenlik)
