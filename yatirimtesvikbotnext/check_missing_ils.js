const fs = require('fs');

// Mevcut iller
const mevcutIller = JSON.parse(fs.readFileSync('./src/data/iller.json', 'utf8'));

// Türkiye'deki tüm 81 il
const tumIller = [
  'ADANA', 'ADIYAMAN', 'AFYONKARAHISAR', 'AGRI', 'AMASYA', 'ANKARA', 'ANTALYA', 'ARTVIN', 'AYDIN', 'BALIKESIR',
  'BILECIK', 'BINGOL', 'BITLIS', 'BOLU', 'BURDUR', 'BURSA', 'CANAKKALE', 'CANKIRI', 'CORUM', 'DENIZLI',
  'DIYARBAKIR', 'EDIRNE', 'ELAZIG', 'ERZINCAN', 'ERZURUM', 'ESKISEHIR', 'GAZIANTEP', 'GIRESUN', 'GUMUSHANE', 'HAKKARI',
  'HATAY', 'ISPARTA', 'MERSIN', 'ISTANBUL', 'IZMIR', 'KARS', 'KASTAMONU', 'KAYSERI', 'KIRKLARELI', 'KIRSEHIR',
  'KOCAELI', 'KONYA', 'KUTAHYA', 'MALATYA', 'MANISA', 'KAHRAMANMARAS', 'MARDIN', 'MUGLA', 'MUS', 'NEVSEHIR',
  'NIGDE', 'ORDU', 'RIZE', 'SAKARYA', 'SAMSUN', 'SIIRT', 'SINOP', 'SIVAS', 'TEKIRDAG', 'TOKAT',
  'TRABZON', 'TUNCELI', 'SANLIURFA', 'USAK', 'VAN', 'YOZGAT', 'ZONGULDAK', 'AKSARAY', 'BAYBURT', 'KARAMAN',
  'KIRIKKALE', 'BATMAN', 'SIRNAK', 'BARTIN', 'ARDAHAN', 'IGDIR', 'YALOVA', 'KARABUK', 'KILIS', 'OSMANIYE',
  'DUZCE'
];

// Eksik illeri bul
const eksikIller = tumIller.filter(il => !mevcutIller[il]);

console.log('Mevcut il sayısı:', Object.keys(mevcutIller).length);
console.log('Toplam il sayısı:', tumIller.length);
console.log('Eksik il sayısı:', eksikIller.length);
console.log('\nEksik iller:');
eksikIller.forEach((il, i) => console.log((i+1) + ':', il));
