/**
 * PAYTR Webhook Handler
 * 
 * PAYTR ödeme sisteminden gelen webhook isteklerini işler.
 * Ödeme durumu değişikliklerini bu endpoint alır.
 * 
 * İleride PAYTR entegrasyonu yapıldığında bu endpoint aktif hale gelecek.
 */

import { NextRequest } from 'next/server';
import { handleApiError, createSuccessResponse } from '@/lib/api/errors';
import { validateRequest } from '@/lib/api/validation';
import { ValidationError, UnauthorizedError, InternalServerError } from '@/lib/api/errors';
import { verifyPaytrCallbackHash } from '@/lib/paytr/utils';
import { env } from '@/lib/env';

// PAYTR webhook validation schema
const paytrWebhookSchema = {
  merchant_oid: {
    required: true,
    type: 'string' as const,
  },
  status: {
    required: true,
    type: 'string' as const,
    pattern: /^(success|failed)$/,
  },
  total_amount: {
    required: true,
    type: 'string' as const,
  },
  hash: {
    required: true,
    type: 'string' as const,
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
    const validation = validateRequest(body, paytrWebhookSchema);
    if (!validation.isValid) {
      throw new ValidationError('Invalid webhook data', validation.errors);
    }

    // Hash doğrulama
    const { hash, id, merchant_oid, status, total_amount } = body;
    const isValidHash = verifyPaytrCallbackHash(
      id || '',
      merchant_oid,
      env.PAYTR_MERCHANT_SALT!,
      status,
      total_amount,
      env.PAYTR_MERCHANT_KEY!,
      hash
    );

    if (!isValidHash) {
      throw new UnauthorizedError('Invalid webhook hash');
    }

    // TODO: Ödeme durumunu veritabanına kaydet
    // const payment = await updatePaymentStatus(body.merchant_oid, body.status);

    // Mock response (ileride kaldırılacak)
    const response = {
      status: 'received',
      merchant_oid: body.merchant_oid,
      payment_status: body.status,
      message: 'Webhook received successfully. PAYTR entegrasyonu hazır durumda.',
      timestamp: new Date().toISOString(),
    };

    // PAYTR, başarılı işlemlerde "OK" bekler
    return Response.json(createSuccessResponse(response), { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET method - Health check
export async function GET() {
  return Response.json(
    createSuccessResponse({
      status: 'ok',
      message: 'PAYTR Webhook endpoint is ready',
      note: 'PAYTR entegrasyonu için hazır. POST endpoint kullanılmalı.',
    })
  );
}
