const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku
const workbook = XLSX.readFile(path.join(__dirname, '../hedefYatirimlar.xlsx'));

// İlk sheet'i al
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// İlk satırı (başlıkları) atla ve veriyi düzenle
const hedefYatirimlar = jsonData.slice(1).map(row => {
  // NACE kodu genellikle ilk sütunda olur
  const naceKodu = row[0] ? row[0].toString().trim() : '';
  
  return {
    kod: naceKodu,
    // Eğer başka sütunlar varsa onları da ekleyebiliriz
    // tanim: row[1] ? row[1].toString().trim() : '',
  };
}).filter(item => item.kod && item.kod !== ''); // Boş satırları filtrele

// JSON dosyasını yaz
const outputPath = path.join(__dirname, '../src/hedefYatirimlar.json');
fs.writeFileSync(outputPath, JSON.stringify(hedefYatirimlar, null, 2));

console.log(`Hedef yatırımlar JSON dosyası oluşturuldu: ${outputPath}`);
console.log(`Toplam ${hedefYatirimlar.length} hedef yatırım kodu eklendi.`);

// İlk birkaç örneği göster
console.log('\nİlk 5 hedef yatırım kodu:');
hedefYatirimlar.slice(0, 5).forEach(item => {
  console.log(`- ${item.kod}`);
}); 