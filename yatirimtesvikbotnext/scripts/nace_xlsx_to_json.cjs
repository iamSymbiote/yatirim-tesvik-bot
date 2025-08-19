const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku - data_sources klasöründen
const workbook = XLSX.readFile(path.join(__dirname, '../src/data_sources/naceGuncel01.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// İlk satırı (başlıkları) atla ve veriyi düzenle
const naceKodlari = jsonData.slice(1).map(row => {
  // NACE kodu genellikle ilk sütunda olur
  const naceKodu = row[0] ? row[0].toString().trim() : '';
  const naceTanimi = row[1] ? row[1].toString().trim() : '';
  
  return {
    kod: naceKodu,
    tanim: naceTanimi
  };
}).filter(item => item.kod && item.kod !== ''); // Boş satırları filtrele

// JSON dosyasını yaz - data klasörüne
const outputPath = path.join(__dirname, '../src/data/nace.json');
fs.writeFileSync(outputPath, JSON.stringify(naceKodlari, null, 2));

console.log(`NACE kodları JSON dosyası oluşturuldu: ${outputPath}`);
console.log(`Toplam ${naceKodlari.length} NACE kodu eklendi.`);

// İlk birkaç örneği göster
console.log('\nİlk 5 NACE kodu:');
naceKodlari.slice(0, 5).forEach(item => {
  console.log(`- ${item.kod}: ${item.tanim}`);
});
