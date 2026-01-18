/**
 * PAYTR Utility Functions
 * PAYTR API ile çalışmak için yardımcı fonksiyonlar
 */

import crypto from 'crypto';

/**
 * PAYTR token (hash) oluşturma
 * @param required - Hash için gerekli string (parametrelerin birleşimi)
 * @param merchantKey - PAYTR merchant key
 * @param merchantSalt - PAYTR merchant salt
 * @returns Base64 encoded HMAC-SHA256 hash
 */
export function createPaytrToken(
  required: string,
  merchantKey: string,
  merchantSalt: string
): string {
  const hash = crypto
    .createHmac('sha256', merchantKey)
    .update(required + merchantSalt)
    .digest('base64');
  return hash;
}

/**
 * PAYTR callback hash doğrulama
 * @param id - Link ID
 * @param merchantOid - Merchant order ID
 * @param merchantSalt - PAYTR merchant salt
 * @param status - Ödeme durumu
 * @param totalAmount - Toplam tutar
 * @param merchantKey - PAYTR merchant key
 * @param receivedHash - PAYTR'den gelen hash
 * @returns Hash doğru mu?
 */
export function verifyPaytrCallbackHash(
  id: string,
  merchantOid: string,
  merchantSalt: string,
  status: string,
  totalAmount: string,
  merchantKey: string,
  receivedHash: string
): boolean {
  const token = id + merchantOid + merchantSalt + status + totalAmount;
  const calculatedHash = crypto
    .createHmac('sha256', merchantKey)
    .update(token)
    .digest('base64');
  return calculatedHash === receivedHash;
}
