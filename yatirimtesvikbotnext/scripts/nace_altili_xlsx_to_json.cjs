const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku - data_sources klasöründen
const workbook = XLSX.readFile(path.join(__dirname, '../src/data_sources/NACE_REV.2.1-ALTILI_(V3.0).xls'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// İlk satırı (başlıkları) atla ve veriyi düzenle
const naceKodlari = jsonData.slice(1).map(row => {
  // NACE kodu 1. sütunda (index 0), tanım 2. sütunda (index 1)
  const naceKodu = row[0] ? row[0].toString().trim() : '';
  const naceTanimi = row[1] ? row[1].toString().trim() : '';
  
  return {
    kod: naceKodu,
    tanim: naceTanimi
  };
}).filter(item => item.kod && item.kod !== '' && item.tanim && item.tanim !== ''); // Boş satırları filtrele

// Duplicate'leri kaldır - sadece unique kodları tut
const uniqueNaceKodlari = [];
const seenKodlar = new Set();

naceKodlari.forEach(item => {
  if (!seenKodlar.has(item.kod)) {
    seenKodlar.add(item.kod);
    uniqueNaceKodlari.push(item);
  }
});

// JSON dosyasını yaz - data klasörüne
const outputPath = path.join(__dirname, '../src/data/nace.json');
fs.writeFileSync(outputPath, JSON.stringify(uniqueNaceKodlari, null, 2));

console.log(`NACE kodları JSON dosyası oluşturuldu: ${outputPath}`);
console.log(`Toplam ${uniqueNaceKodlari.length} unique NACE kodu eklendi.`);
console.log(`Duplicate kayıtlar kaldırıldı: ${naceKodlari.length - uniqueNaceKodlari.length}`);

// İlk birkaç örneği göster
console.log('\nİlk 5 NACE kodu:');
uniqueNaceKodlari.slice(0, 5).forEach(item => {
  console.log(`- ${item.kod}: ${item.tanim}`);
});

// "sera" araması için test
console.log('\n"sera" araması için örnekler:');
const seraResults = uniqueNaceKodlari.filter(item => 
  item.tanim.toLowerCase().includes('sera') || 
  item.kod.toLowerCase().includes('sera')
);
seraResults.slice(0, 3).forEach(item => {
  console.log(`- ${item.kod}: ${item.tanim}`);
});

// "tekstil" araması için test
console.log('\n"tekstil" araması için örnekler:');
const tekstilResults = uniqueNaceKodlari.filter(item => 
  item.tanim.toLowerCase().includes('tekstil') || 
  item.kod.toLowerCase().includes('tekstil')
);
tekstilResults.slice(0, 3).forEach(item => {
  console.log(`- ${item.kod}: ${item.tanim}`);
});
