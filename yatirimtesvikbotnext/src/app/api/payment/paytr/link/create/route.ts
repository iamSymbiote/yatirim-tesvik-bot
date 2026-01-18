/**
 * PAYTR Link API - Create Link
 * 
 * PAYTR Link API kullanarak ödeme linki oluşturur.
 * Detaylı dokümantasyon: https://dev.paytr.com/en/link-api/link-api-create
 */

import { NextRequest } from 'next/server';
import { handleApiError, createSuccessResponse } from '@/lib/api/errors';
import { validateRequest } from '@/lib/api/validation';
import { ValidationError, InternalServerError } from '@/lib/api/errors';
import { createPaytrToken } from '@/lib/paytr/utils';
import { env } from '@/lib/env';

// Link oluşturma için validation schema
const createLinkSchema = {
  name: {
    required: true,
    type: 'string' as const,
    min: 4,
    max: 200,
  },
  price: {
    required: true,
    type: 'number' as const,
    min: 1,
  },
  currency: {
    required: false,
    type: 'string' as const,
    pattern: /^(TL|USD|EUR|GBP)$/,
  },
  max_installment: {
    required: false,
    type: 'number' as const,
    min: 1,
    max: 12,
  },
  link_type: {
    required: true,
    type: 'string' as const,
    pattern: /^(product|collection)$/,
  },
  lang: {
    required: false,
    type: 'string' as const,
    pattern: /^(tr|en)$/,
  },
  email: {
    required: false,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  min_count: {
    required: false,
    type: 'number' as const,
    min: 1,
  },
  max_count: {
    required: false,
    type: 'number' as const,
    min: 1,
  },
  expiry_date: {
    required: false,
    type: 'string' as const,
  },
  callback_link: {
    required: false,
    type: 'string' as const,
    max: 400,
  },
  callback_id: {
    required: false,
    type: 'string' as const,
    max: 64,
  },
  get_qr: {
    required: false,
    type: 'string' as const,
    pattern: /^(0|1)$/,
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
    const validation = validateRequest(body, createLinkSchema);
    if (!validation.isValid) {
      throw new ValidationError('Invalid link creation data', validation.errors);
    }

    const {
      name,
      price,
      currency = 'TL',
      max_installment = '12',
      link_type,
      lang = 'tr',
      email = '',
      min_count = '',
      max_count = '1',
      expiry_date = '',
      callback_link = '',
      callback_id = '',
      get_qr = '',
    } = body;

    // Link type'a göre required alanları kontrol et
    if (link_type === 'collection' && !email) {
      throw new ValidationError('email is required when link_type is collection');
    }
    if (link_type === 'product' && !min_count) {
      throw new ValidationError('min_count is required when link_type is product');
    }

    // Callback validation
    if (callback_link && !callback_id) {
      throw new ValidationError('callback_id is required when callback_link is provided');
    }
    if (callback_id && !callback_link) {
      throw new ValidationError('callback_link is required when callback_id is provided');
    }

    // Price'ı kuruş cinsine çevir (100 ile çarp)
    const priceInKurus = Math.round(price * 100).toString();

    // Token için required string oluştur
    let required = name + priceInKurus + currency + max_installment + link_type + lang;

    if (link_type === 'product') {
      required += min_count.toString();
    } else {
      required += email;
    }

    // PAYTR token oluştur
    const paytr_token = createPaytrToken(
      required,
      env.PAYTR_MERCHANT_KEY!,
      env.PAYTR_MERCHANT_SALT!
    );

    // PAYTR API'ye istek gönder
    const formData = new URLSearchParams();
    formData.append('merchant_id', env.PAYTR_MERCHANT_ID!);
    formData.append('name', name);
    formData.append('price', priceInKurus);
    formData.append('currency', currency);
    formData.append('max_installment', max_installment.toString());
    formData.append('link_type', link_type);
    formData.append('lang', lang);
    formData.append('get_qr', get_qr);
    formData.append('debug_on', '1'); // Entegrasyon hatalarını alabilmek için

    if (link_type === 'product') {
      formData.append('min_count', min_count.toString());
    } else {
      formData.append('email', email);
    }

    if (max_count) {
      formData.append('max_count', max_count.toString());
    }

    if (expiry_date) {
      formData.append('expiry_date', expiry_date);
    }

    if (callback_link) {
      formData.append('callback_link', callback_link);
    }

    if (callback_id) {
      formData.append('callback_id', callback_id);
    }

    formData.append('paytr_token', paytr_token);

    // PAYTR API'ye istek gönder
    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/link/create', {
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
      // PAYTR hata mesajını döndür
      throw new InternalServerError(
        responseData.reason || 'PAYTR link creation failed'
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
      message: 'PAYTR Link Create API is ready',
      note: 'POST endpoint kullanılmalı. PAYTR credentials ayarlanmalı.',
    })
  );
}
