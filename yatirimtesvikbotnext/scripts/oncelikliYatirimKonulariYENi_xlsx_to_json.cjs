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

// Excel dosyasının yapısını kontrol et
console.log('\nExcel dosyasının yapısını kontrol edelim:');
console.log('Worksheet range:', worksheet['!ref']);
console.log('First 10 cells:');
for (let i = 1; i <= 10; i++) {
  const cellA = worksheet[`A${i}`];
  const cellB = worksheet[`B${i}`];
  console.log(`A${i}: ${cellA ? cellA.v : 'undefined'} (type: ${cellA ? typeof cellA.v : 'undefined'})`);
  console.log(`B${i}: ${cellB ? cellB.v : 'undefined'} (type: ${cellB ? typeof cellB.v : 'undefined'})`);
}

// 28.11.08 kodunun Excel'de nasıl göründüğünü kontrol et
console.log('\n28.11.08 kodunu Excel\'de arayalım:');
for (let i = 1; i <= 250; i++) {
  const cellA = worksheet[`A${i}`];
  const cellB = worksheet[`B${i}`];
  if (cellA && cellA.v && cellA.v.toString().includes('28.11.08')) {
    console.log(`Found 28.11.08 in A${i}: ${cellA.v} (type: ${typeof cellA.v})`);
  }
  if (cellB && cellB.v && cellB.v.toString().includes('28.11.08')) {
    console.log(`Found 28.11.08 in B${i}: ${cellB.v} (type: ${typeof cellB.v})`);
  }
}

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
let found21 = false, found28 = false, found281108 = false, all28codes = [];
let allNumericCodes = [];
let allStringCodes = [];

jsonData.forEach((row, index) => {
  if (index === 0) {
    console.log('Header row:', row);
    return; // Başlık satırını atla
  }
  
  // Excel'de A sütunu sayısal NACE kodu, B sütunu açıklama
  // Sayısal değerleri NACE kodlarına çevir
  let kod = '';
  if (row[0]) {
    const rawValue = row[0].toString().trim();
    // Eğer sayısal değer ise, NACE koduna çevir
    if (rawValue.match(/^\d+$/)) {
      allNumericCodes.push(rawValue);
      
      // Sayısal değerleri NACE kodlarına çevir
      const numberToNaceMap = {
        // Ana kategoriler
        '21': '21',
        '26': '26', 
        '20': '20',
        '27': '27',
        
        // 28.11 serisi (Türbin ve motor imalatı)
        '45989': '28.11',    // Motor ve türbin imalatı
        '39780': '28.11.08', // Türbin ve türbin parçalarının imalatı
        '40145': '28.11.09', // Deniz taşıtlarında, demir yolu taşıtlarında...
        '40510': '28.11.10', // İçten yanmalı motorlar, dizel motorlar...
        
        // 28.12 serisi (Akışkan gücü ekipmanları)
        '46019': '28.12',    // Akışkan gücü ile çalışan ekipmanların imalatı
        '38714': '28.12.05', // Akışkan gücü ile çalışan ekipmanların ve bunların parçalarının imalatı
        
        // 28.29 serisi (Genel amaçlı makineler)
        '45685': '28.29',    // Genel amaçlı makinelerin imalatı
        
        // Diğer sayısal kodlar için genel mapping
        '45677': '20.11',    // Temel kimyasalların, gübrelerin ve azot bileşiklerinin imalatı
        '45981': '20.11.10', // Sanayi gazları imalatı
        '37215': '20.11.10', // Sanayi gazları imalatı
        '46011': '20.12.01', // Boya maddeleri ve pigment imalatı
        '37245': '20.12.01', // Boya maddeleri ve pigment imalatı
        '37610': '20.12.02', // Tabaklama ekstreleri, bitkisel kökenli
        '45708': '20.12.03', // Haşere ilaçları, dezenfektanlar
        '45736': '20.12.04', // Boya, vernik ve benzeri kaplayıcı maddeler
        '45767': '20.12.05', // Yıkama, temizleme ve cilalama preparatları
        '45797': '20.12.06', // Diğer kimyasal ürünlerin imalatı
        '45828': '20.12.07', // Suni veya sentetik elyaf imalatı
        '45741': '20.12.08', // Silah ve mühimmat imalatı
        
        // Elektrikli teçhizat serisi
        '45684': '27.11',    // Elektrik motoru, jeneratör, transformatör
        '45988': '27.11.01', // Elektrik motorları, jeneratörler ve transformatörler
        '37222': '27.11.01', // Elektrik motoru, jeneratör ve transformatörlerin imalatı
        '37952': '27.11.02'  // Elektrik motoru, jeneratör ve transformatörlerin aksesuarları
      };
      
      kod = numberToNaceMap[rawValue] || rawValue; // Mapping varsa kullan, yoksa sayısal değeri kullan
    } else {
      allStringCodes.push(rawValue);
      kod = rawValue; // Zaten string formatında NACE kodu
    }
  }
  const tanim = row[1] ? row[1].toString().trim() : '';
  
  // Tüm sayısal kodları logla (ilk 20 tanesi)
  if (row[0] && row[0].toString().trim().match(/^\d+$/) && allNumericCodes.length <= 20) {
    console.log(`Numeric code ${allNumericCodes.length}: ${row[0]} -> ${tanim.substring(0, 50)}...`);
  }
  
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
  if (kod === '28.11.08') {
    console.log('Found 28.11.08 at row', index, ':', row);
    found281108 = true;
  }
  // 28.11.08 kodunun sayısal karşılığını ara
  if (kod === '39780') {
    console.log('Found 39780 (28.11.08) at row', index, ':', row);
    found281108 = true;
  }
  
  // Collect all 28.x codes
  if (kod.startsWith('28.')) {
    all28codes.push({row: index, kod: kod, tanim: tanim});
  }
  
  // Tüm geçerli kod ve tanımları ekle (sayısal ve string kodlar dahil)
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
console.log('28.11.08 found:', found281108);

console.log('\\nCode type analysis:');
console.log('Total numeric codes:', allNumericCodes.length);
console.log('Total string codes:', allStringCodes.length);
console.log('First 10 numeric codes:', allNumericCodes.slice(0, 10));
console.log('First 10 string codes:', allStringCodes.slice(0, 10));

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
