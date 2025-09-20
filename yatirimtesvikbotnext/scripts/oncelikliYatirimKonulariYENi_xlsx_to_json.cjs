const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku
const workbook = XLSX.readFile(path.join(__dirname, '../oncelikliYatirimKonulariYENi.xls'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// NACE kodlarını işle
const naceKodlari = [];
const uniqueKodlar = new Set();

jsonData.forEach((row, index) => {
  if (index === 0) return; // Başlık satırını atla
  
  const kod = row[0] ? row[0].toString().trim() : '';
  const tanim = row[1] ? row[1].toString().trim() : '';
  
  if (kod && tanim && !uniqueKodlar.has(kod)) {
    uniqueKodlar.add(kod);
    naceKodlari.push({
      kod: kod,
      tanim: tanim
    });
  }
});

// JSON dosyasını yaz
const outputPath = path.join(__dirname, '../src/data/oncelikliYatirimKonulariYENi.json');
fs.writeFileSync(outputPath, JSON.stringify(naceKodlari, null, 2));

console.log(`Öncelikli Yatırım Konuları YENİ JSON dosyası oluşturuldu: ${outputPath}`);
console.log(`Toplam ${naceKodlari.length} NACE kodu eklendi.`);

// İlk birkaç örneği göster
console.log('\nİlk 5 NACE kodu:');
naceKodlari.slice(0, 5).forEach((item, i) => {
  console.log(`${i+1}. ${item.kod}: ${item.tanim.substring(0, 60)}...`);
});
