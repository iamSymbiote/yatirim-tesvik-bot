/**
 * PAYTR Link API - Callback Handler
 * 
 * PAYTR Link API'den gelen callback isteklerini işler.
 * Ödeme tamamlandığında PAYTR bu endpoint'e POST isteği gönderir.
 * 
 * Detaylı dokümantasyon: https://dev.paytr.com/en/link-api/link-api-callback
 * 
 * NOT: Bu endpoint, callback_link parametresinde belirtilen URL'dir.
 * PAYTR, ödeme sonucunu bu endpoint'e POST olarak gönderir.
 */

import { NextRequest } from 'next/server';
import { handleApiError, createSuccessResponse } from '@/lib/api/errors';
import { verifyPaytrCallbackHash } from '@/lib/paytr/utils';
import { UnauthorizedError, InternalServerError } from '@/lib/api/errors';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    // Environment variables kontrolü
    if (!env.PAYTR_MERCHANT_ID || !env.PAYTR_MERCHANT_KEY || !env.PAYTR_MERCHANT_SALT) {
      throw new InternalServerError(
        'PAYTR credentials are not configured. Please set PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, and PAYTR_MERCHANT_SALT environment variables.'
      );
    }

    // PAYTR callback'i form-urlencoded formatında gönderir
    const formData = await request.formData();
    
    // Form data'yı object'e çevir
    const callback: Record<string, string> = {};
    formData.forEach((value, key) => {
      callback[key] = value.toString();
    });

    // Gerekli alanları kontrol et
    const { id, merchant_oid, status, total_amount, hash } = callback;

    if (!id || !merchant_oid || !status || !total_amount || !hash) {
      throw new InternalServerError('Missing required callback fields');
    }

    // Hash doğrulama
    const isValidHash = verifyPaytrCallbackHash(
      id,
      merchant_oid,
      env.PAYTR_MERCHANT_SALT!,
      status,
      total_amount,
      env.PAYTR_MERCHANT_KEY!,
      hash
    );

    if (!isValidHash) {
      throw new UnauthorizedError('Invalid callback hash');
    }

    // Ödeme başarılı mı kontrol et
    if (status === 'success') {
      // TODO: Ödeme başarılı - veritabanına kaydet
      // const payment = await updatePaymentStatus(merchant_oid, 'success', {
      //   id,
      //   total_amount,
      //   ...callback,
      // });

    } else {
      // TODO: Ödeme başarısız - veritabanına kaydet
      // const payment = await updatePaymentStatus(merchant_oid, 'failed', {
      //   id,
      //   total_amount,
      //   ...callback,
      // });

    }

    // PAYTR, başarılı işlemlerde "OK" string'i bekler
    return new Response('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch {
    // Hata durumunda bile PAYTR'ye OK dönmemiz gerekiyor
    // Aksi takdirde PAYTR tekrar tekrar istek gönderebilir
    // Ancak log'ları kaydetmeliyiz
    return new Response('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

// GET method - Health check
export async function GET() {
  return Response.json(
    createSuccessResponse({
      status: 'ok',
      message: 'PAYTR Callback endpoint is ready',
      note: 'POST endpoint kullanılmalı. PAYTR bu endpoint\'e callback gönderecek.',
    })
  );
}
