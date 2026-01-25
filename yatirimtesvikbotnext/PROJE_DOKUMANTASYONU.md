# 🚀 Teşvik Robotu Projesi - Kapsamlı Dokümantasyon

## 📋 Proje Genel Bakış

**Proje Adı:** Lore Danışmanlık Teşvik Robotu  
**Versiyon:** 2.0  
**Teknolojiler:** Next.js 15, React 19, TypeScript, Material UI, Tailwind CSS 4  
**Tarih:** Ocak 2025  
**Durum:** Production Ready ✅

## 🎯 Proje Amacı

Yatırım teşviklerini hesaplama, analiz etme ve detaylı rapor oluşturma amacıyla geliştirilmiş modern web uygulaması. Kullanıcılar NACE kodları, yatırım lokasyonu ve diğer kriterleri girerek teşvik hesaplamaları yapabilir, AI destekli detaylı raporlar oluşturabilirler.

---

## 🏗️ Proje Yapısı

```
yatirimtesvikbotnext/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Ana sayfa (Homepage)
│   │   ├── detayli-analiz/
│   │   │   └── page.tsx                # Detaylı analiz sayfası
│   │   ├── layout.tsx                   # Root layout (font optimizasyonu)
│   │   ├── globals.css                 # Global stiller
│   │   ├── ThemeProvider.tsx           # Dark/Light mode sağlayıcısı
│   │   └── api/
│   │       ├── lore/
│   │       │   └── generate-report/
│   │       │       └── route.ts        # Lore API entegrasyonu (Base64 encoding)
│   │       ├── ai-analyze/
│   │       │   └── route.ts            # AI rapor endpoint
│   │       └── payment/
│   │           └── paytr/               # PAYTR ödeme entegrasyonu
│   ├── components/
│   │   ├── PDFReport.tsx.backup        # PDF rapor bileşeni (backup)
│   │   └── PDFReportNew.tsx            # Yeni PDF rapor bileşeni
│   ├── data/                           # JSON veri dosyaları
│   │   ├── nace.json                   # NACE kodları ve tanımları
│   │   ├── iller.json                  # İl ve ilçe verileri
│   │   ├── il_bolge.json               # İl-bölge eşleştirmeleri
│   │   ├── hedefYatirimlar.json        # Hedef yatırım kodları
│   │   ├── yuksekTekno.json            # Yüksek teknoloji kodları
│   │   ├── ortaYuksekTekno.json        # Orta-yüksek teknoloji kodları
│   │   ├── oncelikliYatirimlar.json    # Öncelikli yatırım kodları
│   │   ├── destekVerileri.json         # Destek verileri
│   │   ├── destekUnsurlariBolgeBazli.json # Bölge bazlı destek unsurları
│   │   └── us97.json                   # US97 verileri
│   ├── utils/
│   │   └── yatirimbolgesihesap.ts      # Bölge hesaplama algoritmaları
│   ├── lib/
│   │   ├── env.ts                      # Environment variables yönetimi
│   │   ├── api/
│   │   │   ├── errors.ts               # API error handling
│   │   │   ├── validation.ts           # Request validation
│   │   │   └── rate-limit.ts           # Rate limiting
│   │   └── paytr/
│   │       └── utils.ts                # PAYTR utility fonksiyonları
│   └── middleware.ts                   # Security headers, CORS
├── public/
│   └── assets/
│       ├── lore-logo.png               # Lore Danışmanlık logosu
│       └── tesvik-logo.png             # Teşvik logosu
├── scripts/                            # Excel to JSON dönüştürücüler
│   ├── nace_xlsx_to_json.cjs
│   ├── xlsx_to_json_hedef.js
│   └── ...
└── PROJE_DOKUMANTASYONU.md             # Bu dosya
```

---

## 🚀 Özellikler ve Geliştirmeler

### ✅ Tamamlanan Özellikler

#### 1. **Ana Sayfa (Homepage) - Modern Tasarım**

##### **Tek Kolonlu Layout (Mevcut Tasarım)**
- **Merkezi Kart Tasarımı:**
  - Glassmorphism efekti (backdrop-filter blur)
  - Yuvarlatılmış köşeler (32px border-radius)
  - Subtle shadow ve border
  - Merkezi hizalama (flex column, align-items: center)
  - Responsive: Mobilde padding ve boyutlar optimize edilmiş

- **İçerik Yapısı:**
  - LORE logosu (üstte, merkezi)
  - "Teşvik Robotu" başlığı
  - "Yatırım Teşviklerini Hesaplama Uygulaması" alt başlığı
  - Form alanları dikey sıralama

##### **Form Düzeni**
- **NACE Kodu:** Üstte tek satır, autocomplete ile arama
- **Yatırım Yeri & İlçe:** Birlikte gruplanmış (yatırım yeri üstte, ilçe altta)
- **OSB Sorusu:** Radio button ile Evet/Hayır
- **Kullanıcı Sözleşmesi:** Checkbox + modal (butondan sonra)
- **SORGULA Butonu:** Gradient buton (mor-mavi tonları)

##### **UI/UX İyileştirmeleri**
- ✅ **FOUT/FOIT Düzeltmesi:** Font yükleme sırasında text boyut değişimi engellendi
  - `display: "optional"` ve `adjustFontFallback: true` kullanıldı
  - Fixed `height` değerleri ile layout shift önlendi
- ✅ **Scroll Optimizasyonu:** Sayfa yüklenirken gereksiz scroll kaldırıldı
  - `max-height: 100vh` ve `overflow` kontrolleri
  - Margin/padding optimizasyonu
- ✅ **Minimalist Tasarım:** Profesyonel, modern görünüm
  - Muted renk paleti
  - Subtle shadows ve borders
  - Smooth transitions

#### 2. **Detaylı Analiz Sayfası**

##### **URL Parametreleri (Kısaltılmış)**
- **Eski Format:** `?naceKodu=28&naceAciklama=...&yatirimIli=Adana&...`
- **Yeni Format:** `?n=28&il=Adana&ilce=Kadikoy&osb=hayir&yb=3&db=3&hy=1&yt=1&oyt=1`
- **Geriye Dönük Uyumluluk:** Eski ve yeni parametreler destekleniyor

**Parametre Eşleştirmeleri:**
| Eski | Yeni | Açıklama |
|------|------|----------|
| `naceKodu` | `n` | NACE kodu |
| `yatirimIli` | `il` | Yatırım ili |
| `yatirimIlcesi` | `ilce` | Yatırım ilçesi |
| `hedefYatirim` | `hy` | Hedef yatırım (1=true) |
| `yuksekTeknoloji` | `yt` | Yüksek teknoloji (1=true) |
| `ortaYuksekTeknoloji` | `oyt` | Orta-yüksek teknoloji (1=true) |
| `yatirimBolgesi` | `yb` | Yatırım bölgesi |
| `destekBolgesi` | `db` | Destek bölgesi |

##### **Form Özellikleri**
- Kapsamlı yatırım bilgileri formu
- Dinamik validasyon
- Real-time hesaplamalar
- PDF export özelliği
- AI destekli rapor oluşturma

#### 3. **Lore API Entegrasyonu**

##### **Base64 Encoding (Son Güncelleme)**
- **Endpoint:** `POST /api/lore/generate-report`
- **Veri Formatı:** JSON → Base64 encoded string
- **Güvenlik:** Token `route.ts` içinde saklanıyor

**İşlem Akışı:**
```typescript
1. Frontend'den gelen veri alınır
2. Veri temizlenir (nokta kaldırma, string'e çevirme)
3. JSON.stringify() ile string'e çevrilir
4. Buffer.from(payload, 'utf-8').toString('base64') ile encode edilir
5. Base64 string direkt olarak API'ye gönderilir
```

**Örnek:**
```typescript
const jsonPayload = JSON.stringify(cleanedPayload);
const payloadBase64 = Buffer.from(jsonPayload, 'utf-8').toString('base64');

const response = await fetch('https://lore.polyglotpro.tr/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': token,
  },
  body: payloadBase64, // Direkt Base64 string
});
```

##### **Hata Yönetimi**
- ✅ "Invalid JSON input" hatası çözüldü
- ✅ Robust error handling (try-catch)
- ✅ Detaylı logging
- ✅ Response parsing güvenliği

#### 4. **Dark Mode Tema**

##### **Özellikler**
- **Toggle Butonu:** Sağ üst köşede güneş/ay ikonu
- **Otomatik Kaydetme:** Kullanıcı tercihi localStorage'da saklanır
- **Sistem Tercihi:** İlk açılışta sistem tercihi kontrol edilir
- **Smooth Geçişler:** 0.3s animasyonlu tema değişimi
- **Context API:** `ThemeProvider.tsx` ile merkezi yönetim

##### **Renk Paleti**

**Light Mode:**
- Arka Plan: `#f7f7f7` (açık gri)
- Kart: `#ffffff` (beyaz)
- Form Alanları: `#fafbfc` (çok açık gri)
- Metin: `#222222` (koyu gri)
- Primary: `#2563eb` (mavi)

**Dark Mode:**
- Arka Plan: `#121212` (koyu gri)
- Kart: `#1e1e1e` (orta koyu gri)
- Form Alanları: `#2d2d2d` (açık koyu gri)
- Metin: `#ffffff` (beyaz)
- Primary: `#3b82f6` (açık mavi)

#### 5. **Hedef Yatırım Sistemi**

- **1366 Hedef Kod:** Excel'den JSON'a çevrilen hedef yatırım kodları
- **Otomatik Kontrol:** Seçilen NACE kodu hedef listesinde aranır
- **Dinamik Sonuç:** Eşleşme varsa "EVET", yoksa "HAYIR"
- **Yüksek/Orta-Yüksek Teknoloji:** Ayrı listeler ile kontrol

#### 6. **Bölge Hesaplama Algoritması**

##### **Destek Bölgesi Hesaplama Mantığı**
1. **OSB = "hayır"** → Destek bölgesi = İl bölgesi
2. **OSB = "evet" + İlçe seçili** → Destek bölgesi = İl bölgesi + 2 (max 6)
3. **OSB = "evet" + "Diğer Tüm İlçeler"** → Destek bölgesi = İl bölgesi + 1 (max 6)
4. **OSB = "hayır" + İlçe seçili** → Destek bölgesi = İl bölgesi + 1 (max 6)
5. **OSB = "hayır" + "Diğer Tüm İlçeler"** → Destek bölgesi = İl bölgesi

##### **Asgari Yatırım Tutarı**
- Bölgeye göre minimum tutar hesaplama
- `destekUnsurlariBolgeBazli.json` dosyasından okunur

#### 7. **Kullanıcı Sözleşmesi Modal**

- **Scroll Kontrolü:** Kullanıcı sözleşmeyi sonuna kadar okumadan buton aktif olmaz
- **"Kabul Ediyorum" Butonu:** Mavi gradient, modal kapanır ve checkbox işaretlenir
- **Yönlendirme:** Sorgula butonuna tıklandığında önce modal açılır, kabul edilince detaylı analiz sayfasına yönlendirilir

#### 8. **PDF Export Özelliği**

- `@react-pdf/renderer` kullanılarak PDF oluşturma
- Detaylı analiz sonuçlarını PDF formatında indirme
- `PDFReportNew.tsx` bileşeni ile modern PDF tasarımı

---

## 🔧 Teknik Detaylar

### **Kullanılan Teknolojiler**

#### **Frontend**
- **Next.js 15.3.6:** App Router, Server Components, API Routes
- **React 19.0.0:** Latest React features
- **TypeScript 5:** Type safety
- **Material UI:** Component library
- **Tailwind CSS 4:** Utility-first CSS framework

#### **Backend**
- **Next.js API Routes:** Server-side API endpoints
- **Node.js:** Server runtime

#### **Veri İşleme**
- **xlsx 0.18.5:** Excel dosyalarını JSON'a çevirme
- **Custom Scripts:** Excel to JSON dönüştürücüler

#### **PDF & Export**
- **@react-pdf/renderer 4.3.0:** PDF oluşturma
- **jspdf 3.0.3:** PDF manipülasyonu
- **html2canvas 1.4.1:** HTML to image

### **Önemli Dosyalar ve Fonksiyonlar**

#### **1. `src/app/page.tsx` (Ana Sayfa)**
```typescript
// Ana özellikler:
- NACE kodu autocomplete arama
- İl/İlçe seçimi (Türkçe karakter normalizasyonu)
- OSB seçimi
- Kullanıcı sözleşmesi kontrolü
- Sonuç paneli gösterimi
- URL parametreleri ile detaylı analiz sayfasına yönlendirme
```

#### **2. `src/app/detayli-analiz/page.tsx` (Detaylı Analiz)**
```typescript
// Ana özellikler:
- URL parametrelerinden veri okuma (kısa/uzun format desteği)
- Kapsamlı form (yatırım tutarları, istihdam, süreler)
- Real-time hesaplamalar
- Lore API entegrasyonu (Base64 encoding)
- PDF export
- AI rapor oluşturma
```

#### **3. `src/app/api/lore/generate-report/route.ts` (Lore API)**
```typescript
// İşlemler:
1. Request body'yi parse et
2. Veriyi birleştir (sorguVerileri + formVerileri)
3. Zorunlu alanları kontrol et
4. Veriyi temizle (nokta kaldır, string'e çevir)
5. JSON → Base64 encode
6. Lore API'ye gönder
7. Response'u parse et ve döndür
```

#### **4. `src/utils/yatirimbolgesihesap.ts` (Bölge Hesaplama)**
```typescript
// Fonksiyonlar:
- getBolge(il: string): number // İl bölgesi tespiti
- getDestekBolgesi(ilBolgesi, osb, ilce): number // Destek bölgesi
- getAsgariYatirimTutari(bolge): number // Asgari tutar
```

#### **5. `src/app/ThemeProvider.tsx` (Tema Yönetimi)**
```typescript
// Özellikler:
- Context API ile tema durumu
- localStorage ile tercih saklama
- HTML data-theme attribute
- Material UI theme entegrasyonu
```

#### **6. `src/middleware.ts` (Güvenlik)**
```typescript
// Özellikler:
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- CSP (Content Security Policy)
- Sensitive path protection
- CORS ayarları
```

---

## 📊 Veri Yapıları

### **NACE Kodları (nace.json)**
```json
{
  "kod": "01.11.01",
  "tanim": "Buğday yetiştiriciliği"
}
```

### **İl-İlçe Verileri (iller.json)**
```json
{
  "Adana": ["Seyhan", "Çukurova", "Yüreğir", "Diğer Tüm İlçeler"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Diğer Tüm İlçeler"]
}
```

### **Hedef Yatırımlar (hedefYatirimlar.json)**
```json
["01.41.31", "28.11.01", ...]
```

### **İl-Bölge Eşleştirmesi (il_bolge.json)**
```json
{
  "Adana": 3,
  "Ankara": 2,
  "İstanbul": 1
}
```

---

## 🔐 Güvenlik Özellikleri

### **1. Middleware Güvenliği**
- ✅ Security headers
- ✅ CSP (Content Security Policy)
- ✅ Sensitive path protection
- ✅ CORS ayarları

### **2. API Güvenliği**
- ✅ Rate limiting (50 req/dakika)
- ✅ Request validation
- ✅ Error handling
- ✅ Token güvenliği (route.ts içinde)

### **3. Environment Variables**
- ✅ Type-safe config (`src/lib/env.ts`)
- ✅ Production'da eksik env var kontrolü
- ✅ `.env.example` dosyası

### **4. Input Validation**
- ✅ Form validation
- ✅ XSS koruması
- ✅ SQL injection koruması (JSON kullanımı)

---

## 🌐 API Endpoint'leri

### **1. Lore API - Rapor Oluşturma**
```
POST /api/lore/generate-report
```
- **Request Body:**
  ```json
  {
    "sorguVerileri": { ... },
    "formVerileri": { ... }
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": { ... }
  }
  ```
- **Özellikler:**
  - Base64 encoding
  - Zorunlu alan kontrolü
  - Veri temizleme (nokta kaldırma, string'e çevirme)
  - Detaylı logging

### **2. AI Analyze API**
```
POST /api/ai-analyze
GET /api/ai-analyze (health check)
```
- **Rate Limiting:** 50 request/dakika
- **Validation:** Schema-based validation

### **3. PAYTR Ödeme API'leri
```
POST /api/payment/paytr/link/create      # Link oluşturma
POST /api/payment/paytr/link/delete      # Link silme
POST /api/payment/paytr/link/send-email  # Email gönderme
POST /api/payment/paytr/link/send-sms    # SMS gönderme
POST /api/payment/paytr/webhook          # Webhook handler
POST /api/payment/paytr/callback        # Callback handler
```

Detaylar için `PAYTR_ENTEGRASYON.md` dosyasına bakın.

---

## 🎨 UI/UX İyileştirmeleri

### **Son Güncellemeler (Ocak 2025)**

#### **1. Font Loading Optimizasyonu (FOUT/FOIT Düzeltmesi)**
- **Sorun:** Font yüklenirken text boyutu değişiyordu
- **Çözüm:**
  - `display: "optional"` kullanıldı
  - `adjustFontFallback: true` ile fallback font ayarlandı
  - Fixed `height` değerleri ile layout shift önlendi
  - `line-height`, `display: flex`, `align-items: center` ile merkezleme

#### **2. Scroll Optimizasyonu**
- **Sorun:** Sayfa yüklenirken gereksiz scroll oluşuyordu
- **Çözüm:**
  - `max-height: 100vh` ve `overflow` kontrolleri
  - Margin/padding optimizasyonu
  - `align-items: flex-start` ile container hizalaması

#### **3. Glassmorphism Tasarım**
- **Merkezi Kart:** Glassmorphism efekti ile modern görünüm
- **Backdrop Filter:** Blur efekti ile derinlik hissi
- **Responsive:** Mobilde optimize edilmiş padding ve boyutlar

#### **4. Minimalist Tasarım**
- Muted renk paleti
- Subtle shadows ve borders
- Smooth transitions
- Profesyonel görünüm

---

## 🔄 Güncelleme Süreci

### **Yeni NACE Kodları Ekleme**
1. Excel dosyasını güncelle
2. `scripts/nace_xlsx_to_json.cjs` çalıştır
3. `src/data/nace.json` otomatik güncellenir

### **Yeni Hedef Yatırımlar Ekleme**
1. `hedefYatirimlar.xlsx` dosyasını güncelle
2. `scripts/xlsx_to_json_hedef.js` çalıştır
3. `src/data/hedefYatirimlar.json` otomatik güncellenir

### **Bölge Hesaplama Güncelleme**
1. `src/utils/yatirimbolgesihesap.ts` dosyasını düzenle
2. Algoritma mantığını güncelle
3. Test et ve doğrula

---

## 🐛 Çözülen Sorunlar

### ✅ **"Invalid JSON input" Hatası**
- **Sorun:** Lore API'ye gönderilen veri parse edilemiyordu
- **Çözüm:** Base64 encoding implementasyonu, robust error handling

### ✅ **FOUT/FOIT (Font Loading)**
- **Sorun:** Text boyutu font yüklenirken değişiyordu
- **Çözüm:** Fixed height, font-display: optional, adjustFontFallback

### ✅ **Gereksiz Scroll**
- **Sorun:** Sayfa yüklenirken scroll oluşuyordu
- **Çözüm:** max-height, overflow kontrolleri, margin/padding optimizasyonu

### ✅ **URL Parametreleri Çok Uzun**
- **Sorun:** Detaylı analiz sayfası URL'leri çok uzundu
- **Çözüm:** Kısa parametre isimleri (n, il, ilce, hy, yt, oyt, vb.)
- **Geriye Dönük Uyumluluk:** Eski ve yeni formatlar destekleniyor

### ✅ **CSS Layout Shift**
- **Sorun:** Sayfa yüklenirken elementler kayıyordu
- **Çözüm:** contain: layout, fixed dimensions, proper box-sizing

---

## 📈 Gelecek Planları

### **Kısa Vadeli (1-2 Hafta)**
- [ ] Form validation mesajları iyileştirme
- [ ] Loading states ekleme
- [ ] Error handling geliştirme
- [ ] Performance optimizasyonu (lazy loading, code splitting)

### **Orta Vadeli (1-2 Ay)**
- [ ] PDF export iyileştirmeleri
- [ ] Sonuç geçmişi (localStorage)
- [ ] Kullanıcı hesapları (opsiyonel)
- [ ] AI rapor entegrasyonu tamamlama
- [ ] PAYTR ödeme entegrasyonu aktifleştirme

### **Uzun Vadeli (3-6 Ay)**
- [ ] Mobil uygulama (React Native)
- [ ] Gelişmiş analitik dashboard
- [ ] Çoklu dil desteği (i18n)
- [ ] Admin paneli
- [ ] Veritabanı entegrasyonu

---

## 👥 Geliştirici Notları

### **Kod Standartları**
- ✅ TypeScript strict mode
- ✅ Material UI component'leri
- ✅ CSS-in-JS (sx prop) ve Custom CSS
- ✅ Functional component'ler
- ✅ React Hooks (useState, useEffect, useMemo, useRef)

### **Performans Optimizasyonları**
- ✅ Image optimization (Next.js Image component)
- ✅ Font optimization (next/font/google)
- ✅ Code splitting (automatic with Next.js)
- ✅ Bundle size optimizasyonu

### **Güvenlik**
- ✅ Input validation
- ✅ XSS koruması
- ✅ Security headers
- ✅ Rate limiting
- ✅ Token güvenliği

---

## 📚 Ek Dokümantasyon

- **`PROFESYONEL_GELISTIRMELER.md`:** Güvenlik, API yapısı, middleware detayları
- **`PAYTR_ENTEGRASYON.md`:** PAYTR ödeme entegrasyonu detayları
- **`AIRapor/README.md`:** AI rapor eğitim verileri formatları

---

## 🔗 Önemli Linkler

- **Lore API:** `https://lore.polyglotpro.tr/`
- **Next.js Docs:** https://nextjs.org/docs
- **Material UI:** https://mui.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

## 📝 Changelog

### **v2.0 (Ocak 2025)**
- ✅ Glassmorphism homepage tasarımı (merkezi kart)
- ✅ Base64 encoding ile Lore API entegrasyonu
- ✅ URL parametreleri kısaltma
- ✅ FOUT/FOIT düzeltmesi
- ✅ Scroll optimizasyonu
- ✅ Kullanıcı sözleşmesi modal iyileştirmeleri
- ✅ Modern minimalist tasarım güncellemeleri

### **v1.0 (2024)**
- ✅ İlk sürüm
- ✅ Temel form sistemi
- ✅ Dark mode
- ✅ Bölge hesaplama
- ✅ Hedef yatırım kontrolü

---

**Son Güncelleme:** 24 Ocak 2025  
**Geliştirici:** AI Assistant + Development Team  
**Versiyon:** 2.0  
**Durum:** Production Ready ✅
