const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Yüksek Teknoloji dosyasını işle
function processYuksekTekno() {
  try {
    const workbook = XLSX.readFile('yuksekTekno.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // İlk satırı (başlıkları) atla, sadece NACE kodlarını al
    const naceKodlari = data.slice(1).map(row => {
      if (row[0]) {
        return row[0].toString().trim();
      }
      return null;
    }).filter(kod => kod !== null);
    
    console.log('Yüksek Teknoloji NACE kodları:', naceKodlari.length);
    
    // JSON dosyasına kaydet
    const outputPath = path.join(__dirname, '../src/yuksekTekno.json');
    fs.writeFileSync(outputPath, JSON.stringify(naceKodlari, null, 2));
    console.log('Yüksek teknoloji verileri kaydedildi:', outputPath);
    
    return naceKodlari;
  } catch (error) {
    console.error('Yüksek teknoloji dosyası işlenirken hata:', error);
    return [];
  }
}

// Orta-Yüksek Teknoloji dosyasını işle
function processOrtaYuksekTekno() {
  try {
    const workbook = XLSX.readFile('ortaYuksekTekno.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // İlk satırı (başlıkları) atla, sadece NACE kodlarını al
    const naceKodlari = data.slice(1).map(row => {
      if (row[0]) {
        return row[0].toString().trim();
      }
      return null;
    }).filter(kod => kod !== null);
    
    console.log('Orta-Yüksek Teknoloji NACE kodları:', naceKodlari.length);
    
    // JSON dosyasına kaydet
    const outputPath = path.join(__dirname, '../src/ortaYuksekTekno.json');
    fs.writeFileSync(outputPath, JSON.stringify(naceKodlari, null, 2));
    console.log('Orta-yüksek teknoloji verileri kaydedildi:', outputPath);
    
    return naceKodlari;
  } catch (error) {
    console.error('Orta-yüksek teknoloji dosyası işlenirken hata:', error);
    return [];
  }
}

// Ana fonksiyon
function main() {
  console.log('Teknoloji Excel dosyaları JSON formatına çevriliyor...\n');
  
  const yuksekTekno = processYuksekTekno();
  const ortaYuksekTekno = processOrtaYuksekTekno();
  
  console.log('\nÖzet:');
  console.log(`- Yüksek Teknoloji: ${yuksekTekno.length} kod`);
  console.log(`- Orta-Yüksek Teknoloji: ${ortaYuksekTekno.length} kod`);
  
  // Örnek kodları göster
  if (yuksekTekno.length > 0) {
    console.log('\nYüksek Teknoloji örnek kodları:', yuksekTekno.slice(0, 5));
  }
  if (ortaYuksekTekno.length > 0) {
    console.log('Orta-Yüksek Teknoloji örnek kodları:', ortaYuksekTekno.slice(0, 5));
  }
}

main(); 