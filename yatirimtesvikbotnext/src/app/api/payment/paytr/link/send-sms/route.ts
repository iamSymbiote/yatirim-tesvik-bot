/**
 * PAYTR Link API - Send SMS
 * 
 * PAYTR Link API kullanarak ödeme linkini SMS ile gönderir.
 * Detaylı dokümantasyon: https://dev.paytr.com/en/link-api/link-api-sms-email
 */

import { NextRequest } from 'next/server';
import { handleApiError, createSuccessResponse } from '@/lib/api/errors';
import { validateRequest } from '@/lib/api/validation';
import { ValidationError, InternalServerError } from '@/lib/api/errors';
import { createPaytrToken } from '@/lib/paytr/utils';
import { env } from '@/lib/env';

// SMS gönderme için validation schema
const sendSmsSchema = {
  id: {
    required: true,
    type: 'string' as const,
  },
  cell_phone: {
    required: true,
    type: 'string' as const,
    pattern: /^[0-9]{10,11}$/, // Türkiye telefon formatı
  },
};

export async function POST(request: NextRequest) {
  try {
    // Environment variables kontrolü
    if (!env.PAYTR_MERCHANT_ID || !env.PAYTR_MERCHANT_KEY || !env.PAYTR_MERCHANT_SALT) {
      throw new InternalServerError(
        'PAYTR credentials are not configured. Please set PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, and PAYTR_MERCHANT_SALT environment variables.'
      );
    }

    // Request body'yi parse et
    const body = await request.json();

    // Validation
    const validation = validateRequest(body, sendSmsSchema);
    if (!validation.isValid) {
      throw new ValidationError('Invalid send SMS data', validation.errors);
    }

    const { id, cell_phone } = body;

    // Token için required string oluştur
    const required = id + env.PAYTR_MERCHANT_ID! + cell_phone + env.PAYTR_MERCHANT_SALT!;

    // PAYTR token oluştur
    const paytr_token = createPaytrToken(
      required,
      env.PAYTR_MERCHANT_KEY!,
      env.PAYTR_MERCHANT_SALT!
    );

    // PAYTR API'ye istek gönder
    const formData = new URLSearchParams();
    formData.append('merchant_id', env.PAYTR_MERCHANT_ID!);
    formData.append('id', id);
    formData.append('cell_phone', cell_phone);
    formData.append('debug_on', '1');
    formData.append('paytr_token', paytr_token);

    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/link/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseData = await paytrResponse.json();

    if (responseData.status === 'success') {
      return Response.json(createSuccessResponse(responseData));
    } else {
      throw new InternalServerError(
        responseData.reason || 'PAYTR SMS sending failed'
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// GET method - Health check
export async function GET() {
  return Response.json(
    createSuccessResponse({
      status: 'ok',
      message: 'PAYTR Link Send SMS API is ready',
      note: 'POST endpoint kullanılmalı.',
    })
  );
}
