# Teşvik Robotu Projesi - Dokümantasyon

## 📋 Proje Genel Bakış

**Proje Adı:** Lore Danışmanlık Teşvik Robotu  
**Versiyon:** 1.0  
**Teknolojiler:** Next.js 14, TypeScript, Material UI, Tailwind CSS  
**Tarih:** 2024

## 🎯 Proje Amacı

Yatırım teşviklerini hesaplama ve analiz etme amacıyla geliştirilmiş web uygulaması. Kullanıcılar NACE kodları, yatırım lokasyonu ve diğer kriterleri girerek teşvik hesaplamaları yapabilirler.

## 🏗️ Proje Yapısı

```
yatirimtesvikbotnext/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Ana uygulama sayfası
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global stiller
│   │   └── ThemeProvider.tsx     # Dark/Light mode sağlayıcısı
│   ├── utils/
│   │   └── yatirimbolgesihesap.ts # Bölge hesaplama algoritmaları
│   ├── nace.json                 # NACE kodları ve tanımları
│   ├── iller.json                # İl ve ilçe verileri
│   ├── il_bolge.json            # İl-bölge eşleştirmeleri
│   ├── hedefYatirimlar.json     # Hedef yatırım kodları
│   └── us97.json                # US97 verileri
├── public/
│   └── assets/
│       └── lore-logo.png        # Lore Danışmanlık logosu
├── scripts/
│   └── xlsx_to_json_hedef.js   # Excel to JSON dönüştürücü
└── PROJE_DOKUMANTASYONU.md     # Bu dosya
```

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler

#### 1. **Ana Form Sistemi**
- **NACE Kodu Arama**: Otomatik tamamlama ile NACE kodu/tanım arama
- **Yatırım Yeri Seçimi**: İl ve ilçe seçimi
- **OSB/Endüstri Bölgesi**: Evet/Hayır seçeneği
- **Form Validasyonu**: Zorunlu alanlar kontrolü

#### 2. **Dark Mode Tema**
- **Toggle Butonu**: Sağ üst köşede güneş/ay ikonu
- **Otomatik Kaydetme**: Kullanıcı tercihi localStorage'da saklanır
- **Sistem Tercihi**: İlk açılışta sistem tercihi kontrol edilir
- **Smooth Geçişler**: 0.3s animasyonlu tema değişimi

#### 3. **Sonuç Paneli**
- **Dinamik İçerik**: Seçilen verilere göre sonuçlar
- **NACE Başlığı**: Seçilen NACE kodu ve tanımı
- **Yatırım Yeri Tablosu**: İl, ilçe ve OSB bilgileri
- **Yatırım Özellikleri**: Teknoloji seviyeleri ve hedef yatırım
- **Bölge Hesaplamaları**: Destek bölgesi ve asgari yatırım tutarı

#### 4. **Hedef Yatırım Sistemi**
- **1366 Hedef Kod**: Excel'den JSON'a çevrilen hedef yatırım kodları
- **Otomatik Kontrol**: Seçilen NACE kodu hedef listesinde aranır
- **Dinamik Sonuç**: Eşleşme varsa "EVET", yoksa "HAYIR"

#### 5. **Bölge Hesaplama Algoritması**
- **İl-Bölge Eşleştirmesi**: `il_bolge.json` ile bölge tespiti
- **Destek Bölgesi Hesaplama**: OSB ve ilçe seçimine göre
- **Asgari Yatırım Tutarı**: Bölgeye göre minimum tutar hesaplama

### 🎨 UI/UX Özellikleri

#### **Light Mode**
- **Arka Plan**: `#f7f7f7` (açık gri)
- **Kart Arka Planı**: `#ffffff` (beyaz)
- **Form Alanları**: `#fafbfc` (çok açık gri)
- **Metin**: `#222222` (koyu gri)

#### **Dark Mode**
- **Arka Plan**: `#121212` (koyu gri)
- **Kart Arka Planı**: `#1e1e1e` (orta koyu gri)
- **Form Alanları**: `#2d2d2d` (açık koyu gri)
- **Metin**: `#ffffff` (beyaz)

## 🔧 Teknik Detaylar

### **Kullanılan Teknolojiler**
- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material UI (MUI)
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React Hooks (useState, useEffect)
- **Data Processing**: Node.js scripts (Excel to JSON)

### **Önemli Dosyalar**

#### **ThemeProvider.tsx**
```typescript
// Dark/Light mode yönetimi
- Context API ile tema durumu
- localStorage ile tercih saklama
- HTML data-theme attribute
- Material UI theme entegrasyonu
```

#### **yatirimbolgesihesap.ts**
```typescript
// Bölge hesaplama fonksiyonları
- getBolge(): İl bölgesi tespiti
- getDestekBolgesi(): Destek bölgesi hesaplama
- getAsgariYatirimTutari(): Minimum tutar hesaplama
```

#### **page.tsx**
```typescript
// Ana uygulama bileşeni
- Form state yönetimi
- NACE kodu arama
- Hedef yatırım kontrolü
- Sonuç paneli render
```

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
  "ad": "İstanbul",
  "ilceler": ["Kadıköy", "Beşiktaş", ...]
}
```

### **Hedef Yatırımlar (hedefYatirimlar.json)**
```json
{
  "kod": "01.41.31"
}
```

## 🎯 Algoritma Detayları

### **Destek Bölgesi Hesaplama**
1. **OSB = "hayır"** → Destek bölgesi = İl bölgesi
2. **OSB = "evet" + İlçe seçili** → Destek bölgesi = İl bölgesi + 2 (max 6)
3. **OSB = "evet" + "Diğer Tüm İlçeler"** → Destek bölgesi = İl bölgesi + 1 (max 6)
4. **OSB = "hayır" + İlçe seçili** → Destek bölgesi = İl bölgesi + 1 (max 6)
5. **OSB = "hayır" + "Diğer Tüm İlçeler"** → Destek bölgesi = İl bölgesi

### **Hedef Yatırım Kontrolü**
1. Kullanıcı NACE kodu seçer
2. `hedefYatirimlar.json` dosyasında kod aranır
3. Eşleşme varsa → "EVET"
4. Eşleşme yoksa → "HAYIR"

## 🔄 Güncelleme Süreci

### **Yeni NACE Kodları Ekleme**
1. Excel dosyasını güncelle
2. `scripts/nace_xlsx_to_json.js` çalıştır
3. `src/nace.json` otomatik güncellenir

### **Yeni Hedef Yatırımlar Ekleme**
1. `hedefYatirimlar.xlsx` dosyasını güncelle
2. `scripts/xlsx_to_json_hedef.js` çalıştır
3. `src/hedefYatirimlar.json` otomatik güncellenir

### **Bölge Hesaplama Güncelleme**
1. `src/utils/yatirimbolgesihesap.ts` dosyasını düzenle
2. Algoritma mantığını güncelle
3. Test et ve doğrula

## 🐛 Bilinen Sorunlar

### **Çözülen Sorunlar**
- ✅ Dark mode toggle butonu görünüyordu ama tema değişmiyordu
- ✅ CSS selector'ları `[data-mui-color-scheme]` yerine `[data-theme]` kullanılıyor
- ✅ HTML elementine `data-theme` attribute'u eklendi

### **Potansiyel İyileştirmeler**
- [ ] Responsive tasarım optimizasyonu
- [ ] Form validation mesajları
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimizasyonu

## 📈 Gelecek Planları

### **Kısa Vadeli (1-2 Hafta)**
- [ ] Form validation geliştirmeleri
- [ ] Responsive tasarım iyileştirmeleri
- [ ] Loading states ekleme
- [ ] Error handling geliştirme

### **Orta Vadeli (1-2 Ay)**
- [ ] PDF export özelliği
- [ ] Sonuç geçmişi
- [ ] Kullanıcı hesapları
- [ ] API entegrasyonu

### **Uzun Vadeli (3-6 Ay)**
- [ ] Mobil uygulama
- [ ] Gelişmiş analitik
- [ ] Çoklu dil desteği
- [ ] Admin paneli

## 👥 Geliştirici Notları

### **Kod Standartları**
- TypeScript strict mode kullanılıyor
- Material UI component'leri tercih ediliyor
- CSS-in-JS (sx prop) kullanılıyor
- Functional component'ler tercih ediliyor

### **Performans Optimizasyonları**
- Image optimization (Next.js Image component)
- Lazy loading
- Code splitting
- Bundle size optimizasyonu

### **Güvenlik**
- Input validation
- XSS koruması
- CSRF koruması (gelecekte)

---

**Son Güncelleme:** 2024  
**Geliştirici:** AI Assistant  
**Versiyon:** 1.0 