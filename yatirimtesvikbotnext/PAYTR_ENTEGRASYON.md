# 💳 PAYTR Link API Entegrasyonu

Bu dokümantasyon, PAYTR Link API entegrasyonunun nasıl kullanılacağını açıklar.

## 📋 Endpoint'ler

### 1. Link Oluşturma
**Endpoint:** `POST /api/payment/paytr/link/create`

Ödeme linki oluşturur.

**Request Body:**
```json
{
  "name": "Yatırım Teşvik Raporu",           // Ürün/Hizmet adı (4-200 karakter)
  "price": 99.99,                            // Fiyat (TL cinsinden, otomatik kuruşa çevrilir)
  "currency": "TL",                          // TL, USD, EUR, GBP (opsiyonel, default: TL)
  "max_installment": 12,                      // Max taksit (1-12, opsiyonel, default: 12)
  "link_type": "product",                    // "product" veya "collection" (zorunlu)
  "lang": "tr",                              // "tr" veya "en" (opsiyonel, default: tr)
  "min_count": 1,                            // link_type="product" ise zorunlu
  "email": "user@example.com",                // link_type="collection" ise zorunlu
  "max_count": 1,                             // Opsiyonel
  "expiry_date": "2024-12-31 23:59:59",     // Opsiyonel (format: YYYY-MM-DD HH:mm:ss)
  "callback_link": "https://yourdomain.com/api/payment/paytr/callback",  // Opsiyonel
  "callback_id": "unique_callback_id",      // callback_link varsa zorunlu
  "get_qr": "1"                              // QR kod isteniyorsa "1" (opsiyonel)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "link": "https://www.paytr.com/odeme/guvenli/XXXXXX",
    "id": "XXXXXX",
    "qr_code": "base64_encoded_png"  // get_qr="1" ise
  }
}
```

**Örnek Kullanım:**
```typescript
const response = await fetch('/api/payment/paytr/link/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Yatırım Teşvik Raporu - Detaylı Analiz',
    price: 199.99,
    link_type: 'product',
    min_count: 1,
    callback_link: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/paytr/callback`,
    callback_id: `report_${reportId}`,
  }),
});
```

---

### 2. Link Silme
**Endpoint:** `POST /api/payment/paytr/link/delete`

Oluşturulan ödeme linkini siler.

**Request Body:**
```json
{
  "id": "XXXXXX"  // PAYTR link ID'si
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success"
  }
}
```

---

### 3. SMS Gönderme
**Endpoint:** `POST /api/payment/paytr/link/send-sms`

Ödeme linkini SMS ile gönderir.

**Request Body:**
```json
{
  "id": "XXXXXX",              // PAYTR link ID'si
  "cell_phone": "05551234567"  // Telefon numarası (10-11 haneli)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success"
  }
}
```

---

### 4. Email Gönderme
**Endpoint:** `POST /api/payment/paytr/link/send-email`

Ödeme linkini email ile gönderir.

**Request Body:**
```json
{
  "id": "XXXXXX",                    // PAYTR link ID'si
  "email": "user@example.com"        // Email adresi
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success"
  }
}
```

---

### 5. Callback Handler
**Endpoint:** `POST /api/payment/paytr/callback`

PAYTR'den gelen ödeme sonucu bildirimlerini alır. Bu endpoint, `callback_link` parametresinde belirtilen URL'dir.

**Not:** Bu endpoint'e PAYTR tarafından otomatik olarak POST isteği gönderilir. Manuel çağrı yapılmaz.

**PAYTR'den Gelen Data (form-urlencoded):**
- `id`: Link ID
- `merchant_oid`: Sizin belirlediğiniz order ID (callback_id)
- `status`: "success" veya "failed"
- `total_amount`: Ödenen tutar (kuruş cinsinden)
- `hash`: Güvenlik hash'i

**Response:**
PAYTR, başarılı işlemlerde "OK" string'i bekler.

---

## 🔐 Environment Variables

PAYTR entegrasyonu için aşağıdaki environment variable'ları ayarlanmalıdır:

```bash
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
```

**Netlify'da Ayarlama:**
1. Netlify Dashboard → Site Settings → Environment Variables
2. Yukarıdaki 3 değişkeni ekleyin
3. Deploy'u yeniden başlatın

---

## 🔄 Kullanım Senaryosu

### Senaryo: Rapor Ödemesi

1. **Kullanıcı rapor oluşturur** → Frontend'de rapor hazırlanır
2. **Ödeme linki oluşturulur:**
```typescript
const linkResponse = await fetch('/api/payment/paytr/link/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: `Yatırım Teşvik Raporu - ${reportId}`,
    price: 199.99,
    link_type: 'product',
    min_count: 1,
    callback_link: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/paytr/callback`,
    callback_id: `report_${reportId}`,
  }),
});

const { data } = await linkResponse.json();
// data.link → Kullanıcıya gösterilecek ödeme linki
```

3. **Kullanıcı ödeme yapar** → PAYTR ödeme sayfasına yönlendirilir
4. **Ödeme tamamlanır** → PAYTR `/api/payment/paytr/callback` endpoint'ine POST isteği gönderir
5. **Callback handler ödemeyi işler:**
   - Hash doğrulaması yapılır
   - Ödeme durumu veritabanına kaydedilir (TODO)
   - Kullanıcıya bildirim gönderilir (TODO)

---

## 🛡️ Güvenlik

1. **Hash Doğrulama:** Tüm callback'lerde hash doğrulaması yapılır
2. **Environment Variables:** Credentials asla kod içinde hardcode edilmez
3. **HTTPS:** Production'da mutlaka HTTPS kullanılmalı
4. **Callback URL:** `callback_link` mutlaka HTTPS ile başlamalı, localhost olamaz

---

## 📝 Önemli Notlar

1. **Price Formatı:** Frontend'den TL cinsinden gönderilir, backend otomatik olarak kuruşa çevirir (×100)
2. **Link Type:**
   - `product`: Ürün/hizmet satışı → `min_count` zorunlu
   - `collection`: Fatura/cari tahsilat → `email` zorunlu
3. **Callback:** `callback_link` ve `callback_id` birlikte kullanılmalı
4. **QR Code:** `get_qr="1"` gönderilirse, response'ta Base64 PNG QR kodu döner
5. **Expiry Date:** Format: `YYYY-MM-DD HH:mm:ss` (Türkiye saati)

---

## 🧪 Test Etme

### Development'ta Test:
```bash
# 1. Environment variables'ı .env.local dosyasına ekleyin
PAYTR_MERCHANT_ID=test_id
PAYTR_MERCHANT_KEY=test_key
PAYTR_MERCHANT_SALT=test_salt

# 2. Development server'ı başlatın
npm run dev

# 3. Endpoint'leri test edin
curl http://localhost:3000/api/payment/paytr/link/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Raporu",
    "price": 99.99,
    "link_type": "product",
    "min_count": 1
  }'
```

### Production'da:
- PAYTR test modunu kullanabilirsiniz
- Gerçek ödeme yapmadan test edebilirsiniz

---

## 🐛 Hata Yönetimi

Tüm endpoint'ler standart error response formatı döndürür:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid link creation data",
    "fields": {
      "name": "name must be at least 4 characters"
    }
  }
}
```

**Yaygın Hatalar:**
- `PAYTR credentials are not configured` → Environment variables ayarlanmamış
- `Invalid webhook hash` → Callback hash doğrulaması başarısız
- `PAYTR link creation failed` → PAYTR API hatası (reason field'ında detay var)

---

## 📚 Kaynaklar

- [PAYTR Link API Dokümantasyonu](https://dev.paytr.com/en/link-api/link-api-create)
- [PAYTR Hata Kodları](https://dev.paytr.com/en/error-codes)
