/**
 * Rate Limiting Utility
 * 
 * Basit bir in-memory rate limiting implementasyonu.
 * Production'da Redis gibi bir cache sistemi kullanılabilir.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

const defaultOptions: Required<RateLimitOptions> = {
  maxRequests: 100,
  windowMs: 60000, // 1 dakika
};

/**
 * Rate limit kontrolü yapar
 * @param identifier - Kullanıcıyı tanımlayan unique identifier (IP, user ID, etc.)
 * @param options - Rate limit ayarları
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const { maxRequests, windowMs } = { ...defaultOptions, ...options };
  const now = Date.now();
  const key = identifier;

  // Mevcut kaydı kontrol et
  const record = store[key];

  // Kayıt yoksa veya süresi dolmuşsa yeni kayıt oluştur
  if (!record || now > record.resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };

    // Eski kayıtları temizle (memory leak önleme)
    cleanupExpiredRecords(now);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // Limit aşılmış mı kontrol et
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Sayacı artır
  record.count++;

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Süresi dolmuş kayıtları temizle
 */
function cleanupExpiredRecords(now: number) {
  // Her 1000 kayıtta bir temizlik yap (performance için)
  if (Object.keys(store).length % 1000 === 0) {
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }
}

/**
 * Rate limit header'larını oluştur
 */
export function getRateLimitHeaders(
  allowed: boolean,
  remaining: number,
  resetTime: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': defaultOptions.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    ...(allowed ? {} : { 'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString() }),
  };
}
