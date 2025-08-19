const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku - data_sources klasöründen
const workbook = XLSX.readFile(path.join(__dirname, '../src/data_sources/oncelikliYatirimlar.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1});

console.log('Excel dosyası yapısı:');
console.log('Toplam satır sayısı:', jsonData.length);
console.log('İlk 5 satır:');
console.log(JSON.stringify(jsonData.slice(0, 5), null, 2));

// Öncelikli yatırım listesi oluştur
const oncelikliYatirimlar = [];

// İlk satırı atla (başlık olabilir), diğer satırları al
jsonData.slice(1).forEach((satir, index) => {
  if (satir && satir.length > 0) {
    // Her satırdaki kod ve açıklamayı al
    const kod = satir[0];
    const aciklama = satir[1];
    if (kod && kod.toString().trim()) {
      oncelikliYatirimlar.push({
        kod: kod.toString().trim(),
        aciklama: aciklama ? aciklama.toString().trim() : ''
      });
    }
  }
});

console.log('Öncelikli yatırım listesi:');
console.log('Toplam öncelikli yatırım sayısı:', oncelikliYatirimlar.length);
console.log('İlk 5 öncelikli yatırım:');
oncelikliYatirimlar.slice(0, 5).forEach((item, index) => {
  console.log(`${index + 1}. ${item.kod}: ${item.aciklama.substring(0, 10)}...`);
});

// Sonucu JSON dosyasına yaz
const outputPath = path.join(__dirname, '../src/data/oncelikliYatirimlar.json');
fs.writeFileSync(outputPath, JSON.stringify(oncelikliYatirimlar, null, 2));

console.log('\nÖncelikli yatırımlar JSON dosyası oluşturuldu:', outputPath); 