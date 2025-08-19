const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku - data_sources klasöründen
const workbook = XLSX.readFile(path.join(__dirname, '../src/data_sources/altBolgeListe01.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Ana iller listesi (sabit veri)
const anaIller = [
  'ADANA', 'ADIYAMAN', 'AFYONKARAHİSAR', 'AĞRI', 'AMASYA', 'ANKARA', 'ANTALYA', 'ARTVİN', 'AYDIN', 'BALIKESİR',
  'BİLECİK', 'BİNGÖL', 'BİTLİS', 'BOLU', 'BURDUR', 'BURSA', 'ÇANAKKALE', 'ÇANKIRI', 'ÇORUM', 'DENİZLİ',
  'DİYARBAKIR', 'EDİRNE', 'ELAZIĞ', 'ERZİNCAN', 'ERZURUM', 'ESKİŞEHİR', 'GAZİANTEP', 'GİRESUN', 'GÜMÜŞHANE', 'HAKKARİ',
  'HATAY', 'ISPARTA', 'MERSİN', 'İSTANBUL', 'İZMİR', 'KARS', 'KASTAMONU', 'KAYSERİ', 'KIRKLARELİ', 'KIRŞEHİR',
  'KOCAELİ', 'KONYA', 'KÜTAHYA', 'MALATYA', 'MANİSA', 'KAHRAMANMARAŞ', 'MARDİN', 'MUĞLA', 'MUŞ', 'NEVŞEHİR',
  'NİĞDE', 'ORDU', 'RİZE', 'SAKARYA', 'SAMSUN', 'SİİRT', 'SİNOP', 'SİVAS', 'TEKİRDAĞ', 'TOKAT',
  'TRABZON', 'TUNCELİ', 'ŞANLIURFA', 'UŞAK', 'VAN', 'YOZGAT', 'ZONGULDAK', 'AKSARAY', 'BAYBURT', 'KARAMAN',
  'KIRIKKALE', 'BATMAN', 'ŞIRNAK', 'BARTIN', 'ARDAHAN', 'IĞDIR', 'YALOVA', 'KARABÜK', 'KİLİS', 'OSMANİYE',
  'DÜZCE'
];

// İl ve ilçe verilerini düzenle
const illerVeIlceler = {};
let lastIl = '';

jsonData.forEach((row, index) => {
  if (index === 0) return; // Başlık satırını atla
  
  const il = row[0] ? row[0].toString().trim() : '';
  const ilce = row[1] ? row[1].toString().trim() : '';
  
  if (il && anaIller.includes(il.toUpperCase())) {
    // Bu bir ana il
    lastIl = il.toUpperCase();
    if (!illerVeIlceler[lastIl]) {
      illerVeIlceler[lastIl] = [];
    }
  } else if (ilce && lastIl) {
    // Bu bir ilçe, son il'e ekle
    if (!illerVeIlceler[lastIl]) {
      illerVeIlceler[lastIl] = [];
    }
    illerVeIlceler[lastIl].push(ilce);
  }
});

// Her il için "Diğer Tüm İlçeler" seçeneğini ekle
Object.keys(illerVeIlceler).forEach(il => {
  if (illerVeIlceler[il].length > 0) {
    illerVeIlceler[il].push('Diğer Tüm İlçeler');
  }
});

// JSON dosyasını yaz - data klasörüne
const outputPath = path.join(__dirname, '../src/data/iller.json');
fs.writeFileSync(outputPath, JSON.stringify(illerVeIlceler, null, 2));

console.log(`İl ve ilçe JSON dosyası oluşturuldu: ${outputPath}`);
console.log(`Toplam ${Object.keys(illerVeIlceler).length} il eklendi.`);

// İlk birkaç örneği göster
console.log('\nİlk 3 il ve ilçeleri:');
Object.keys(illerVeIlceler).slice(0, 3).forEach(il => {
  console.log(`${il}: ${illerVeIlceler[il].length} ilçe`);
  console.log(`  İlçeler: ${illerVeIlceler[il].slice(0, 5).join(', ')}...`);
});
