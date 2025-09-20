/* eslint-disable */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku
const workbook = XLSX.readFile(path.join(__dirname, '../oncelikliYatirimKonulariYENi.xls'));
console.log('Sheet names:', workbook.SheetNames);
const sheetName = workbook.SheetNames[0];
console.log('Using sheet:', sheetName);
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log('Total rows in Excel:', jsonData.length);

// NACE kodlarını işle
const naceKodlari = [];
let processedCount = 0;
let skippedEmptyCount = 0;
let skippedNoKodCount = 0;
let skippedNoTanimCount = 0;

console.log('\nFirst 10 rows from Excel:');
jsonData.slice(0, 10).forEach((row, i) => {
  console.log(`Row ${i}:`, row);
});

console.log('\nSearching for specific codes...');
let found21 = false, found28 = false, all28codes = [];

jsonData.forEach((row, index) => {
  if (index === 0) {
    console.log('Header row:', row);
    return; // Başlık satırını atla
  }
  
  const kod = row[0] ? row[0].toString().trim() : '';
  const tanim = row[1] ? row[1].toString().trim() : '';
  
  // Empty row check
  if (!kod && !tanim) {
    skippedEmptyCount++;
    return;
  }
  
  // Only kod without tanim
  if (kod && !tanim) {
    console.log(`Row ${index}: Only kod '${kod}' without tanim - skipping`);
    skippedNoTanimCount++;
    return;
  }
  
  // Only tanim without kod
  if (!kod && tanim) {
    console.log(`Row ${index}: Only tanim '${tanim.substring(0, 50)}...' without kod - skipping`);
    skippedNoKodCount++;
    return;
  }
  
  // Specific codes search
  if (kod === '21.10.20') {
    console.log('Found 21.10.20 at row', index, ':', row);
    found21 = true;
  }
  if (kod === '28.12.05') {
    console.log('Found 28.12.05 at row', index, ':', row);
    found28 = true;
  }
  
  // Collect all 28.x codes
  if (kod.startsWith('28.')) {
    all28codes.push({row: index, kod: kod, tanim: tanim});
  }
  
  // Tüm geçerli kod ve tanımları ekle (duplikat kontrolü KALDIRILDI)
  if (kod && tanim) {
    naceKodlari.push({
      kod: kod,
      tanim: tanim
    });
    processedCount++;
  }
});

console.log('\nProcessing Summary:');
console.log('Total rows processed:', processedCount);
console.log('Skipped empty rows:', skippedEmptyCount);
console.log('Skipped rows with kod but no tanim:', skippedNoTanimCount);
console.log('Skipped rows with tanim but no kod:', skippedNoKodCount);

console.log('\\nSearch results:');
console.log('21.10.20 found:', found21);
console.log('28.12.05 found:', found28);
console.log('\\nAll 28.x codes in Excel:');
all28codes.forEach(item => {
  console.log('  ' + item.kod + ': ' + item.tanim.substring(0, 60) + '...');
});
console.log('Total 28.x codes: ' + all28codes.length);

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
