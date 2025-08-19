const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku - data_sources klasöründen
const workbook = XLSX.readFile(path.join(__dirname, '../src/data_sources/destekUnsurlari.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// İlk satır bölge başlıkları
const bolgeBasliklari = jsonData[0];

// Destek unsurları başlıkları (sabit değerler)
const destekUnsurlariBasliklari = [
  "KDV İstisnası",
  "Gümrük Vergisi Muafiyeti",
  "Vergi İndirimi",
  "Yatırıma Katkı Oranı",
  "Sigorta Primi İşveren Hissesi Desteği"
];

// Bölge bazında veri yapısı oluştur
const bolgeBazindaDestekler = {};

bolgeBasliklari.forEach((bolge, bolgeIndex) => {
  if (bolge && bolgeIndex >= 0) {
    const bolgeAdi = bolge.toString().trim();
    bolgeBazindaDestekler[bolgeAdi] = [];

    destekUnsurlariBasliklari.forEach((baslik, baslikIndex) => {
      const satirIndex = baslikIndex + 1;
      if (jsonData[satirIndex] && jsonData[satirIndex][bolgeIndex]) {
        let deger = jsonData[satirIndex][bolgeIndex].toString().trim();

        // Sigorta Primi İşveren Hissesi Desteği için özel format
        if (baslik === "Sigorta Primi İşveren Hissesi Desteği") {
          if (deger.toLowerCase() === "yok") {
            deger = "YOK";
          } else {
            deger = `${deger} YIL`;
          }
        } else {
          // Diğer değerleri büyük harfe çevir
          if (deger.toLowerCase() === "var") {
            deger = "VAR";
          } else if (deger.toLowerCase() === "yok") {
            deger = "YOK";
          } else {
            deger = deger.toUpperCase();
          }
        }

        const destekUnsuru = {
          ad: baslik,
          aciklama: getDestekAciklamasi(baslik),
          deger: deger
        };
        bolgeBazindaDestekler[bolgeAdi].push(destekUnsuru);
      }
    });
  }
});

// Destek açıklamalarını döndüren fonksiyon
function getDestekAciklamasi(baslik) {
  const aciklamalar = {
    "KDV İstisnası": "Teşvik belgesi kapsamında yurt içinden ve yurt dışından temin edilecek yatırım malı makine ve teçhizat ile belge kapsamındaki yazılım ve gayri maddi hak satış ve kiralamaları için katma değer vergisinin ödenmemesi şeklinde uygulanır.",
    "Gümrük Vergisi Muafiyeti": "Teşvik Belgesi kapsamında yurt dışından temin edilecek yatırım malı makine ve teçhizat için Yürürlükteki İthalat Rejimi Kararı gereğince uygulanması gereken gümrük vergisi oranının %0 olarak uygulanmasıdır.",
    "Vergi İndirimi": "Gelir veya kurumlar vergisinin, yatırım için öngörülen katkı tutarına ulaşıncaya kadar, % 60 indirimli olarak uygulanmasıdır.",
    "Yatırıma Katkı Oranı": "Toplam Faydalanılacak vergi indiriminin yatırıma olan oranını ifade eder.",
    "Sigorta Primi İşveren Hissesi Desteği": "Teşvik belgesi kapsamı yatırımla sağlanan ilave istihdam için ödenmesi gereken sigorta primi işveren hissesinin asgari ücrete tekabül eden kısmının 6 ncı bölgede gerçekleştirilen yatırımlar için tamamı, diğer bölgelerde gerçekleştirilen yatırımlar için %50'sinin Bakanlıkça karşılanmasıdır."
  };
  return aciklamalar[baslik] || "";
}

// Sonucu JSON dosyasına yaz
const outputPath = path.join(__dirname, '../src/data/destekUnsurlariBolgeBazli.json');
fs.writeFileSync(outputPath, JSON.stringify(bolgeBazindaDestekler, null, 2));

console.log('Destek unsurları bölge bazlı JSON dosyası oluşturuldu:', outputPath);
console.log('Bölgeler:', Object.keys(bolgeBazindaDestekler));
console.log('Örnek veri (1. Bölge):', JSON.stringify(bolgeBazindaDestekler['1. Bölge'], null, 2)); 