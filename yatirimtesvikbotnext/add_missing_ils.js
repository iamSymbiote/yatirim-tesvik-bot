const fs = require('fs');

// Mevcut iller
const mevcutIller = JSON.parse(fs.readFileSync('./src/data/iller.json', 'utf8'));

// Eksik iller ve ilçeleri (basit ilçe listesi ile)
const eksikIller = {
  'ADIYAMAN': ['Diğer Tüm İlçeler'],
  'AGRI': ['Diğer Tüm İlçeler'],
  'ARTVIN': ['Diğer Tüm İlçeler'],
  'BINGOL': ['Diğer Tüm İlçeler'],
  'BITLIS': ['Diğer Tüm İlçeler'],
  'CANAKKALE': ['Diğer Tüm İlçeler'],
  'CANKIRI': ['Diğer Tüm İlçeler'],
  'CORUM': ['Diğer Tüm İlçeler'],
  'DIYARBAKIR': ['Diğer Tüm İlçeler'],
  'EDIRNE': ['Diğer Tüm İlçeler'],
  'ELAZIG': ['Diğer Tüm İlçeler'],
  'ESKISEHIR': ['Diğer Tüm İlçeler'],
  'GUMUSHANE': ['Diğer Tüm İlçeler'],
  'HAKKARI': ['Diğer Tüm İlçeler'],
  'HATAY': ['Diğer Tüm İlçeler'],
  'ISPARTA': ['Diğer Tüm İlçeler'],
  'ISTANBUL': ['Diğer Tüm İlçeler'],
  'IZMIR': ['Diğer Tüm İlçeler'],
  'KARS': ['Diğer Tüm İlçeler'],
  'KIRSEHIR': ['Diğer Tüm İlçeler'],
  'KUTAHYA': ['Diğer Tüm İlçeler'],
  'MALATYA': ['Diğer Tüm İlçeler'],
  'KAHRAMANMARAS': ['Diğer Tüm İlçeler'],
  'MARDIN': ['Diğer Tüm İlçeler'],
  'MUGLA': ['Diğer Tüm İlçeler'],
  'MUS': ['Diğer Tüm İlçeler'],
  'NEVSEHIR': ['Diğer Tüm İlçeler'],
  'NIGDE': ['Diğer Tüm İlçeler'],
  'SIIRT': ['Diğer Tüm İlçeler'],
  'TEKIRDAG': ['Diğer Tüm İlçeler'],
  'TUNCELI': ['Diğer Tüm İlçeler'],
  'SANLIURFA': ['Diğer Tüm İlçeler'],
  'USAK': ['Diğer Tüm İlçeler'],
  'VAN': ['Diğer Tüm İlçeler'],
  'BAYBURT': ['Diğer Tüm İlçeler'],
  'BATMAN': ['Diğer Tüm İlçeler'],
  'SIRNAK': ['Diğer Tüm İlçeler'],
  'BARTIN': ['Diğer Tüm İlçeler'],
  'ARDAHAN': ['Diğer Tüm İlçeler'],
  'IGDIR': ['Diğer Tüm İlçeler'],
  'YALOVA': ['Diğer Tüm İlçeler'],
  'KARABUK': ['Diğer Tüm İlçeler'],
  'DUZCE': ['Diğer Tüm İlçeler']
};

// Eksik illeri mevcut illere ekle
const yeniIller = { ...mevcutIller, ...eksikIller };

// JSON dosyasını yaz
fs.writeFileSync('./src/data/iller.json', JSON.stringify(yeniIller, null, 2));

console.log('Eksik iller eklendi!');
console.log('Toplam il sayısı:', Object.keys(yeniIller).length);
console.log('Eklenen il sayısı:', Object.keys(eksikIller).length);
