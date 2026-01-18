/**
 * PAYTR Ödeme Oluşturma API Endpoint
 * 
 * Kullanıcı ödeme yapmak istediğinde, bu endpoint PAYTR'ye ödeme isteği gönderir
 * ve ödeme sayfası URL'ini döndürür.
 * 
 * İleride PAYTR entegrasyonu yapıldığında bu endpoint aktif hale gelecek.
 */

import { NextRequest } from 'next/server';
import { handleApiError, createSuccessResponse } from '@/lib/api/errors';
import { validateRequest } from '@/lib/api/validation';
import { ValidationError } from '@/lib/api/errors';

// Ödeme oluşturma için validation schema
const createPaymentSchema = {
  amount: {
    required: true,
    type: 'number' as const,
    min: 1,
  },
  reportId: {
    required: false,
    type: 'string' as const,
  },
  userEmail: {
    required: true,
    type: 'string' as const,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  userName: {
    required: true,
    type: 'string' as const,
    min: 2,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    const body = await request.json();

    // Validation
    const validation = validateRequest(body, createPaymentSchema);
    if (!validation.isValid) {
      throw new ValidationError('Invalid payment data', validation.errors);
    }

    const { amount, reportId, userEmail, userName } = body;

    // TODO: PAYTR'ye ödeme isteği gönderilecek
    // const merchantId = env.PAYTR_MERCHANT_ID;
    // const merchantKey = env.PAYTR_MERCHANT_KEY;
    // const merchantSalt = env.PAYTR_MERCHANT_SALT;
    // 
    // const merchantOid = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // 
    // const paymentData = {
    //   merchant_id: merchantId,
    //   merchant_key: merchantKey,
    //   merchant_oid: merchantOid,
    //   email: userEmail,
    //   payment_amount: amount * 100, // Kuruş cinsinden
    //   currency: 'TL',
    //   // ... diğer PAYTR parametreleri
    // };
    // 
    // const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams(paymentData),
    // });

    // Mock response (ileride kaldırılacak)
    const mockPayment = {
      paymentId: `payment_${Date.now()}`,
      merchantOid: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      status: 'pending',
      paymentUrl: null, // İleride PAYTR'den gelecek
      message: 'PAYTR entegrasyonu henüz yapılmadı. Bu endpoint hazır durumda.',
      timestamp: new Date().toISOString(),
    };

    return Response.json(createSuccessResponse(mockPayment));
  } catch (error) {
    return handleApiError(error);
  }
}

// GET method - Health check
export async function GET() {
  return Response.json(
    createSuccessResponse({
      status: 'ok',
      message: 'PAYTR Create Payment API is ready',
      note: 'PAYTR entegrasyonu için hazır. POST endpoint kullanılmalı.',
    })
  );
}
