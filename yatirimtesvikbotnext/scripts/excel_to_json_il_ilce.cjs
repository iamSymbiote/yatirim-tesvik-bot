const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel dosyasını oku - data_sources klasöründen
const workbook = XLSX.readFile(path.join(__dirname, '../src/data_sources/altBolgeListe01.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON'a çevir
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Excel'deki il isimleri ve doğru karşılıkları (düzgün format: sadece ilk harf büyük)
const ilIsimleri = {
  'Adana': 'Adana',
  'Afyonkarahisar': 'Afyonkarahisar',
  'Aksaray': 'Aksaray',
  'Amasya': 'Amasya',
  'Ankara': 'Ankara',
  'Antalya': 'Antalya',
  'Aydın': 'Aydın',
  'Balıkesir': 'Balıkesir',
  'Bilecik': 'Bilecik',
  'Bolu': 'Bolu',
  'Burdur': 'Burdur',
  'Bursa': 'Bursa',
  'Denizli': 'Denizli',
  'Düzce': 'Düzce',
  'Edime': 'Edirne', // Excel'de "Edime" yazıyor ama "Edirne" olmalı
  'Elazığ': 'Elazığ',
  'Erzincan': 'Erzincan',
  'Erzurum': 'Erzurum',
  'Eskişehir': 'Eskişehir',
  'Gaziantep': 'Gaziantep',
  'Giresun': 'Giresun',
  'Karabük': 'Karabük',
  'Karaman': 'Karaman',
  'Kastamonu': 'Kastamonu',
  'Kayseri': 'Kayseri',
  'Kilis': 'Kilis',
  'Kocaeli': 'Kocaeli',
  'Konya': 'Konya',
  'Kütahya': 'Kütahya',
  'Kırklareli': 'Kırklareli',
  'Kırıkkale': 'Kırıkkale',
  'Kırşehir': 'Kırşehir',
  'Manisa': 'Manisa',
  'Mersin': 'Mersin',
  'Muğla': 'Muğla',
  'Nevşehir': 'Nevşehir',
  'Niğde': 'Niğde',
  'Ordu': 'Ordu',
  'Osmaniye': 'Osmaniye',
  'Rize': 'Rize',
  'Sakarya': 'Sakarya',
  'Samsun': 'Samsun',
  'Sinop': 'Sinop',
  'Sivas': 'Sivas',
  'Tekirdağ': 'Tekirdağ',
  'Tokat': 'Tokat',
  'Trabzon': 'Trabzon',
  'Uşak': 'Uşak',
  'Yozgat': 'Yozgat',
  'Zonguldak': 'Zonguldak',
  'Çanakkale': 'Çanakkale',
  'Çankırı': 'Çankırı',
  'Çorum': 'Çorum',
  'İsparta': 'Isparta', // Excel'de "İsparta" yazıyor ama "Isparta" olmalı
  'İzmir': 'İzmir'
};

// İl ve ilçe verilerini düzenle
const illerVeIlceler = {};
let lastIl = '';

jsonData.forEach((row, index) => {
  if (index === 0) return; // Başlık satırını atla
  
  const il = row[0] ? row[0].toString().trim() : '';
  const ilce = row[1] ? row[1].toString().trim() : '';
  
  if (il && ilIsimleri[il]) {
    // Bu bir ana il - doğru isimle kaydet
    lastIl = ilIsimleri[il];
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

// Her il için "Diğer Tüm İlçeler" seçeneğini en alta ekle
Object.keys(illerVeIlceler).forEach(il => {
  if (illerVeIlceler[il].length > 0) {
    // "Diğer Tüm İlçeler" varsa kaldır, sonra en alta ekle
    illerVeIlceler[il] = illerVeIlceler[il].filter(ilce => ilce !== 'Diğer Tüm İlçeler');
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
