/**
 * AI Rapor Oluşturma API Endpoint
 * 
 * Bu endpoint, kullanıcının girdiği verileri alıp dış AI servisine gönderir
 * ve detaylı rapor oluşturur.
 * 
 * İleride AI servisi hazır olduğunda bu endpoint aktif hale gelecek.
 */

import { NextRequest } from 'next/server';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/api/errors';
import { validateRequest } from '@/lib/api/validation';
import { ValidationError, InternalServerError, RateLimitError } from '@/lib/api/errors';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/api/rate-limit';

// AI rapor isteği için validation schema
const aiReportSchema = {
  sorguVerileri: {
    required: true,
    type: 'object' as const,
  },
  formVerileri: {
    required: true,
    type: 'object' as const,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimit = checkRateLimit(clientId, {
      maxRequests: 50, // AI endpoint için daha düşük limit
      windowMs: 60000, // 1 dakika
    });

    if (!rateLimit.allowed) {
      const headers = getRateLimitHeaders(
        rateLimit.allowed,
        rateLimit.remaining,
        rateLimit.resetTime
      );
      throw new RateLimitError('Too many requests. Please try again later.');
    }

    // Request body'yi parse et
    const body = await request.json();

    // Validation
    const validation = validateRequest(body, aiReportSchema);
    if (!validation.isValid) {
      throw new ValidationError('Invalid request data', validation.errors);
    }

    // TODO: İleride AI servisine istek gönderilecek
    // Şu an için mock response döndürüyoruz
    const { sorguVerileri, formVerileri } = body;

    // AI servisi entegrasyonu buraya eklenecek
    // const aiResponse = await fetch(env.AI_API_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${env.AI_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     sorguVerileri,
    //     formVerileri,
    //   }),
    // });

    // Mock response (ileride kaldırılacak)
    const mockReport = {
      reportId: `report_${Date.now()}`,
      status: 'pending',
      message: 'AI servisi henüz entegre edilmedi. Bu endpoint hazır durumda.',
      data: {
        sorguVerileri,
        formVerileri,
        timestamp: new Date().toISOString(),
      },
    };

    // Rate limit header'larını ekle
    const headers = getRateLimitHeaders(
      rateLimit.allowed,
      rateLimit.remaining,
      rateLimit.resetTime
    );

    return Response.json(createSuccessResponse(mockReport), { headers });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET method - Health check
export async function GET() {
  return Response.json(
    createSuccessResponse({
      status: 'ok',
      message: 'AI Analyze API is ready',
      note: 'AI servisi entegrasyonu için hazır. POST endpoint kullanılmalı.',
    })
  );
}
