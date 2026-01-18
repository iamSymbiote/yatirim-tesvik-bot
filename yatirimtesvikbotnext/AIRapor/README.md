# AI Rapor Oluşturma - Veri Formatları ve Açıklamalar

Bu klasör, yatırım teşvik botu için AI rapor oluşturma sistemine eğitim verisi sağlamak amacıyla hazırlanmıştır.

## 📁 Dosya Yapısı

### Veri Dosyaları (JSON)
1. **nace.json** - NACE kodları ve açıklamaları
2. **iller.json** - İl/İlçe listesi (her il için ilçeler array olarak)
3. **il_bolge.json** - İl-Bölge eşleştirmesi (her il için bölge numarası: 1-6)
4. **hedefYatirimlar.json** - Hedef yatırım kapsamındaki NACE kodları listesi
5. **oncelikliYatirimlar.json** - Öncelikli yatırım kapsamındaki NACE kodları listesi
6. **oncelikliYatirimKonulariYENi.json** - Öncelikli yatırım konuları detayları
7. **yuksekTekno.json** - Yüksek teknoloji NACE kodları array
8. **ortaYuksekTekno.json** - Orta-yüksek teknoloji NACE kodları array
9. **destekUnsurlariBolgeBazli.json** - Bölge bazlı destek unsurları (1. Bölge, 2. Bölge, vb. key'leri)
10. **destekVerileri.json** - Destek verileri
11. **us97.json** - US97 verileri

### Konfigürasyon Dosyaları (JSON)
12. **yatirimbolgesihesap.json** - Bölge hesaplama mantığı açıklaması
13. **programConfigs.json** - Teşvik programları konfigürasyonları (YKO, vergi indirimi, SGK süreleri, faiz desteği)
14. **oncelikliYatirimKonulari.json** - Öncelikli yatırım konuları (a-y arası harflerle kodlanmış)

---

## 📥 İlk Sayfa Sorgu Verileri (URL Parametreleri)

Kullanıcı ana sayfada sorgu yaptıktan sonra "Detaylı Analiz Sayfasına Git" butonuna tıkladığında, aşağıdaki parametreler URL'de gönderilir:

```json
{
  "naceKodu": "string",           // NACE kodu (örn: "28.11")
  "naceAciklama": "string",        // NACE açıklaması/tanımı
  "yatirimIli": "string",          // Yatırım yapılacak il (örn: "Ankara")
  "yatirimIlcesi": "string",       // Yatırım yapılacak ilçe (boş olabilir veya "Diğer Tüm İlçeler")
  "osb": "string",                 // OSB durumu: "evet" veya "hayir"
  "yatirimBolgesi": "string",      // Ana bölge numarası: "1", "2", "3", "4", "5", "6"
  "destekBolgesi": "string",       // Faydalanılacak destek bölgesi: "1", "2", "3", "4", "5", "6"
  "hedefYatirim": "string",        // "true" veya yok (boolean değil, string)
  "oncelikliYatirim": "string",    // "true" veya yok
  "yuksekTeknoloji": "string",     // "true" veya yok
  "ortaYuksekTeknoloji": "string"  // "true" veya yok
}
```

**Örnek URL:**
```
/detayli-analiz?naceKodu=28.11&naceAciklama=Başka%20yerde%20sınıflandırılmamış%20makine&yatirimIli=Ankara&yatirimIlcesi=Çankaya&osb=hayir&yatirimBolgesi=1&destekBolgesi=1&hedefYatirim=true&ortaYuksekTeknoloji=true
```

---

## 📝 Detaylı Analiz Sayfası Form Verileri

Kullanıcı detaylı analiz sayfasında formu doldurup "Rapor Oluştur" butonuna tıkladığında, aşağıdaki veriler toplanır:

```json
{
  "sirketAdi": "string",                    // Şirket adı/unvanı (zorunlu)
  "kobiStatusu": "string",                   // "KOBİ" veya "Büyük İşletme" (zorunlu)
  "naceKodu": "string",                     // NACE kodu (URL'den gelir)
  "naceSearch": "string",                   // NACE kodu + açıklama (örn: "28.11 - Başka yerde...")
  "yatirimTuru": "string",                  // "Komple yeni yatırım", "Tevsi", "Kapasite artırımı" (zorunlu)
  "mevcutIstihdam": "string",               // Mevcut istihdam sayısı (sayı string olarak)
  "faaliyetSuresi": "string",               // Faaliyette bulunma süresi (yıl, sayı string olarak)
  "ilaveIstihdam": "string",                // Sağlanacak ilave istihdam sayısı (zorunlu, sayı string)
  "ithalMakine": "string",                  // İthal makine teçhizat tutarı (TL, formatlanmış: "1.500.000")
  "yerliMakine": "string",                   // Yerli makine teçhizat tutarı (TL, formatlanmış)
  "binaInsaat": "string",                   // Bina inşaat giderleri (TL, formatlanmış)
  "digerGiderler": "string",                 // Diğer yatırım giderleri (TL, formatlanmış)
  "sabitYatirimTutari": "string",           // Toplam sabit yatırım tutarı (hesaplanır)
  "yatirimIli": "string",                   // Yatırım ili (URL'den gelir)
  "yatirimIlcesi": "string",                // Yatırım ilçesi (URL'den gelir)
  "yatirimBolgesi": "string",                // Ana bölge: "1", "2", "3", "4", "5", "6" (URL'den gelir)
  "tamamlanmaSuresiAy": "string",           // Tamamlanma süresi (ay, 1-54 arası, zorunlu)
  "sektorelProgram": "string",              // "HedefYatirim" veya "OncelikliYatirim"
  "ozelProgram": "string",                   // "THP", "YKHP", "SHP" veya boş (Türkiye Yüzyılı Kalkınma Hamlesi)
  "dijitalProgram": "string",               // "DDP", "YDP" veya boş (Yeşil ve Dijital Dönüşüm)
  "oncelikliUrun": "string",                 // Öncelikli ürün bilgisi
  "oncelikliYatirimKonusu": "string",        // Öncelikli yatırım konusu
  "hedefYatirim": "boolean",                 // true/false (URL'den gelir)
  "oncelikliYatirim": "boolean",             // true/false (URL'den gelir)
  "yuksekTeknoloji": "boolean",              // true/false (URL'den gelir)
  "ortaYuksekTeknoloji": "boolean"           // true/false (URL'den gelir)
}
```

---

## 🔄 AI'a Gönderilecek Veri Formatı

**ÖNEMLİ:** Aşağıdaki örnek veriler sadece **format gösterimi** içindir. Gerçek kullanımda, her sorguda kullanıcının girdiği **dinamik veriler** gönderilecektir. Bu örnekler statik değildir ve her sorguda değişecektir.

AI rapor oluşturma servisine gönderilecek veri, yukarıdaki iki bölümün birleşimi olmalıdır. **Her sorguda farklı değerler gönderilecektir:**

```json
{
  "sorguVerileri": {
    "naceKodu": "string",              // Her sorguda farklı NACE kodu
    "naceAciklama": "string",           // Her sorguda farklı açıklama
    "yatirimIli": "string",             // Her sorguda farklı il
    "yatirimIlcesi": "string",          // Her sorguda farklı ilçe (boş olabilir)
    "osb": "string",                    // "evet" veya "hayir"
    "yatirimBolgesi": "string",         // "1", "2", "3", "4", "5", "6"
    "destekBolgesi": "string",          // "1", "2", "3", "4", "5", "6"
    "hedefYatirim": boolean,             // true/false (NACE koduna göre dinamik)
    "oncelikliYatirim": boolean,        // true/false (NACE koduna göre dinamik)
    "yuksekTeknoloji": boolean,          // true/false (NACE koduna göre dinamik)
    "ortaYuksekTeknoloji": boolean      // true/false (NACE koduna göre dinamik)
  },
  "formVerileri": {
    "sirketAdi": "string",              // Kullanıcının girdiği şirket adı
    "kobiStatusu": "string",            // "KOBİ" veya "Büyük İşletme"
    "yatirimTuru": "string",            // "Komple yeni yatırım", "Tevsi", "Kapasite artırımı"
    "mevcutIstihdam": "string",         // Kullanıcının girdiği sayı
    "faaliyetSuresi": "string",         // Kullanıcının girdiği yıl
    "ilaveIstihdam": "string",          // Kullanıcının girdiği sayı
    "ithalMakine": "string",            // Kullanıcının girdiği tutar (formatlanmış)
    "yerliMakine": "string",            // Kullanıcının girdiği tutar (formatlanmış)
    "binaInsaat": "string",            // Kullanıcının girdiği tutar (formatlanmış)
    "digerGiderler": "string",         // Kullanıcının girdiği tutar (formatlanmış)
    "sabitYatirimTutari": "string",     // Hesaplanan toplam tutar
    "tamamlanmaSuresiAy": "string",     // Kullanıcının girdiği ay (1-54)
    "sektorelProgram": "string",        // "HedefYatirim" veya "OncelikliYatirim"
    "ozelProgram": "string",            // "THP", "YKHP", "SHP" veya boş
    "dijitalProgram": "string",        // "DDP", "YDP" veya boş
    "oncelikliUrun": "string",         // Kullanıcının girdiği bilgi (boş olabilir)
    "oncelikliYatirimKonusu": "string"  // Kullanıcının girdiği bilgi (boş olabilir)
  }
}
```

**Örnek (Sadece format gösterimi için - gerçek kullanımda değerler her sorguda değişir):**
```json
{
  "sorguVerileri": {
    "naceKodu": "28.11",
    "naceAciklama": "Başka yerde sınıflandırılmamış makine ve ekipman imalatı",
    "yatirimIli": "Ankara",
    "yatirimIlcesi": "Çankaya",
    "osb": "hayir",
    "yatirimBolgesi": "1",
    "destekBolgesi": "1",
    "hedefYatirim": true,
    "oncelikliYatirim": false,
    "yuksekTeknoloji": false,
    "ortaYuksekTeknoloji": true
  },
  "formVerileri": {
    "sirketAdi": "Deneme Test firması",
    "kobiStatusu": "KOBİ",
    "yatirimTuru": "Komple yeni yatırım",
    "mevcutIstihdam": "0",
    "faaliyetSuresi": "0",
    "ilaveIstihdam": "50",
    "ithalMakine": "50.000.000",
    "yerliMakine": "100.000.000",
    "binaInsaat": "50.000.000",
    "digerGiderler": "15.000.000",
    "sabitYatirimTutari": "215.000.000",
    "tamamlanmaSuresiAy": "36",
    "sektorelProgram": "HedefYatirim",
    "ozelProgram": "",
    "dijitalProgram": "",
    "oncelikliUrun": "",
    "oncelikliYatirimKonusu": ""
  }
}
```

**⚠️ UYARI:** Yukarıdaki örnek veriler sadece format göstermek içindir. Gerçek sistemde her kullanıcı sorgusunda farklı değerler gönderilecektir. AI, bu dinamik verileri alıp her sorgu için özel rapor oluşturmalıdır.

---

## 📊 Rapor Çıktı Formatı

AI'dan beklenen rapor çıktısı, ikinci fotoğraftaki gibi detaylı bir analiz raporu olmalıdır. Rapor şu bölümleri içermelidir:

1. **Şirket ve Proje Bilgileri**
   - Şirket adı
   - KOBİ statüsü
   - Faaliyet alanı (NACE kodu ve açıklama)
   - Yatırımın türü

2. **Yatırım Projesi Bilgileri**
   - Mevcut istihdam
   - Faaliyette bulunma süresi
   - Sağlanacak ilave istihdam

3. **Yatırım Maliyetleri**
   - İthal makine teçhizat
   - Yerli makine teçhizat
   - Bina inşaat giderleri
   - Diğer yatırım giderleri
   - Toplam sabit yatırım

4. **Yatırım Lokasyonu**
   - İl
   - Bölge
   - Tamamlanma süresi

5. **Uygunluk Özeti**
   - Hedef Yatırım: Evet/Hayır
   - Öncelikli Yatırım: Evet/Hayır
   - Yüksek Teknoloji: Evet/Hayır
   - Orta-Yüksek Teknoloji: Evet/Hayır

6. **Destek Unsurları**
   - Bölge bazlı destek unsurları (destekUnsurlariBolgeBazli.json'dan)
   - Yatırıma Katkı Oranı (YKO)
   - Vergi İndirimi Oranı
   - SGK Primi İşveren Hissesi Desteği (SPİHD) süresi
   - Faiz/Kâr Payı Desteği bilgileri
   - KDV İstisnası ve Gümrük Vergisi Muafiyeti

7. **Kritik Analiz ve Öneriler**
   - Öncelikli ürün listesi kontrolü
   - Program avantajları
   - KOBİ statüsü avantajları
   - YDO (Yeniden Değerleme Oranı) etkisi
   - Sonuç ve öneriler

---

## 🔍 Önemli Notlar

1. **Bölge Hesaplama**: `yatirimbolgesihesap.json` dosyasında bölge hesaplama mantığı detaylı olarak açıklanmıştır.

2. **Program Seçimi**: 
   - Eğer `oncelikliYatirim: true` ise, varsayılan olarak "Öncelikli Yatırımlar Teşvik Sistemi" seçilir
   - Eğer sadece `hedefYatirim: true` ise, "Hedef Yatırımlar Teşvik Sistemi" seçilir
   - Kullanıcı formda değiştirebilir

3. **Asgari Yatırım Tutarları**:
   - 1. ve 2. Bölge: 15.100.000 TL
   - 3., 4., 5., 6. Bölge: 7.500.000 TL

4. **Destek Unsurları**: `destekUnsurlariBolgeBazli.json` dosyasında bölge bazlı destek unsurları saklanmaktadır. Key formatı: "1. Bölge", "2. Bölge", vb.

5. **Program Konfigürasyonları**: `programConfigs.json` dosyasında her program için YKO, vergi indirimi, SGK süreleri, faiz desteği limitleri ve asgari yatırım tutarları tanımlanmıştır.

---

## 📧 Kullanım

Bu klasördeki tüm dosyaları AI eğitimi için kullanabilirsiniz. AI'a gönderilecek veri formatı yukarıda açıklanmıştır. AI, bu verileri kullanarak detaylı bir yatırım teşvik analiz raporu oluşturmalıdır.
