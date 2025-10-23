"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import styles from './page.module.css';

export default function DetayliAnaliz() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [formData, setFormData] = useState({
    sirketAdi: '',
    kobiStatusu: 'KOBİ',
    naceKodu: '',
    naceSearch: '',
    yatirimTuru: 'Komple yeni yatırım',
    mevcutIstihdam: '',
    faaliyetSuresi: '',
    ilaveIstihdam: '',
    ithalMakine: '',
    yerliMakine: '',
    binaInsaat: '',
    digerGiderler: '',
    sabitYatirimTutari: '',
    yatirimIli: '',
    yatirimIlcesi: '',
    yatirimBolgesi: '1',
    tamamlanmaSuresiAy: '',
    ozelProgram: 'HedefYatirim',
    oncelikliUrun: '',
    oncelikliYatirimKonusu: ''
  });

  const [showReport, setShowReport] = useState(false);
  const [reportContent, setReportContent] = useState('');

  const toggleTheme = () => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      // Body background'ını da değiştir
      document.body.style.backgroundColor = newMode === 'dark' ? '#1a1a1a' : '#ffffff';
      return newMode;
    });
  };

  // URL parametrelerini oku ve form verilerini güncelle
  useEffect(() => {
    const naceKodu = searchParams.get('naceKodu');
    const naceAciklama = searchParams.get('naceAciklama');
    const il = searchParams.get('il');
    const ilce = searchParams.get('ilce');
    const osb = searchParams.get('osb');
    const faydalanacakBolge = searchParams.get('faydalanacakBolge');
    
    if (naceKodu) {
      const aciklama = naceAciklama && naceAciklama !== 'undefined' ? naceAciklama : 'Açıklama bulunamadı';
      setFormData(prev => ({
        ...prev,
        naceKodu: naceKodu,
        naceSearch: `${naceKodu} - ${aciklama}`,
        yatirimIli: il || '',
        yatirimBolgesi: faydalanacakBolge || ''
      }));
    }
  }, [searchParams]);

  // Component mount olduğunda body background'ını ayarla
  useEffect(() => {
    document.body.style.backgroundColor = mode === 'dark' ? '#1a1a1a' : '#ffffff';
    
    // Component unmount olduğunda temizle
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [mode]);

  // İl-Bölge mapping
  const ilBolgeMap: { [key: string]: number } = {
    "Adana": 3, "Adıyaman": 6, "Afyonkarahisar": 4, "Ağrı": 6, "Aksaray": 4, "Amasya": 4,
    "Ankara": 1, "Antalya": 1, "Ardahan": 6, "Artvin": 4, "Aydın": 2, "Balıkesir": 2,
    "Bartın": 5, "Batman": 6, "Bayburt": 5, "Bilecik": 3, "Bingöl": 6, "Bitlis": 6,
    "Bolu": 2, "Burdur": 3, "Bursa": 1, "Çanakkale": 2, "Çankırı": 5, "Çorum": 4,
    "Denizli": 2, "Diyarbakır": 6, "Düzce": 3, "Edirne": 2, "Elazığ": 4, "Erzincan": 4,
    "Erzurum": 5, "Eskişehir": 1, "Gaziantep": 3, "Giresun": 5, "Gümüşhane": 6, "Hakkari": 6,
    "Hatay": 5, "Iğdır": 6, "Isparta": 3, "İstanbul": 1, "İzmir": 1, "Kahramanmaraş": 5,
    "Karabük": 3, "Karaman": 3, "Kars": 6, "Kastamonu": 4, "Kayseri": 2, "Kilis": 5,
    "Kırıkkale": 3, "Kırklareli": 3, "Kırşehir": 4, "Kocaeli": 1, "Konya": 2, "Kütahya": 3,
    "Malatya": 4, "Manisa": 2, "Mardin": 6, "Mersin": 3, "Muğla": 1, "Muş": 6,
    "Nevşehir": 3, "Niğde": 5, "Ordu": 5, "Osmaniye": 5, "Rize": 3, "Sakarya": 2,
    "Samsun": 3, "Siirt": 6, "Sinop": 5, "Sivas": 4, "Şanlıurfa": 6, "Şırnak": 6,
    "Tekirdağ": 2, "Tokat": 5, "Trabzon": 3, "Tunceli": 5, "Uşak": 3, "Van": 6,
    "Yalova": 2, "Yozgat": 5, "Zonguldak": 3
  };

  // Öncelikli yatırım konuları
  const oncelikliYatirimKonulari: { [key: string]: string } = {
    'a': 'Dijital/Yeşil Dönüşüm Programı kapsamındaki yatırımlar',
    'b': 'Yüksek teknolojili ürün üretimi yatırımları',
    'c': 'Orta-yüksek teknolojili ürün üretimi yatırımları',
    'ç': '6. bölge yatırımları',
    'd': 'Savunma sanayii yatırımları',
    'e': 'Güneş/Rüzgar enerjisi elektrik üretim tesisi yatırımları',
    'f': 'Maden girdili elektrik üretimi yatırımları',
    'g': 'Nükleer enerji santrali yatırımları',
    'ğ': 'LNG ve yer altı doğal gaz depolama yatırımları',
    'h': 'Maden istihraç ve/veya işleme yatırımları',
    'ı': 'Maden arama yatırımları',
    'i': 'Ar-Ge yatırımları',
    'j': 'Ar-Ge/Tasarım projesi ilişkili yatırımlar',
    'k': 'Teknolojik Ürün Deneyim Belgeli ürün üretimi yatırımları',
    'l': 'Test merkezi yatırımları',
    'm': 'İhtisas serbest bölgelerinde yazılım/bilişim yatırımları',
    'n': 'Veri merkezi yatırımları',
    'o': 'Bulut hizmeti sağlayıcı yatırımları',
    'ö': 'Çevre lisansına tabi yatırımlar',
    'p': 'Demiryolu, denizyolu veya havayolu taşımacılık yatırımları',
    'r': 'Yük taşımacılığına yönelik liman yatırımları',
    's': 'Turizm konaklama yatırımları',
    'ş': 'Özel sektör eğitim yatırımları',
    't': 'Yaşlı/engelli bakım merkezi yatırımları',
    'u': 'Lisanslı depoculuk yatırımları',
    'ü': 'Otomasyona dayalı topraksız sera yatırımları',
    'v': 'Deprem/yangın riskine karşı yapılan yatırımlar',
    'y': 'Afet teknolojileri alanındaki yatırımlar'
  };

  // Program konfigürasyonları
  const programConfigs = {
    HedefYatirim: {
      name: "Hedef Yatırımlar Teşvik Sistemi",
      yko: 20,
      vergiIndirimOrani: 60,
      sgkSure: { 1: 0, 2: 1, 3: 2, 4: 4, 5: 8, 6: 12 },
      faizDestegi: true,
      faizSadeceBolge456: true,
      faizMax: 12000000,
      faizAzamiOran: 0.10,
      minYatirim: { bolge12: 12000000, bolge3456: 6000000 }
    },
    OncelikliYatirim: {
      name: "Öncelikli Yatırımlar Teşvik Sistemi",
      yko: 30,
      vergiIndirimOrani: 60,
      sgkSure: { 1: 0, 2: 1, 3: 2, 4: 4, 5: 8, 6: 12 },
      faizDestegi: true,
      faizSadeceBolge456: false,
      faizMax: 24000000,
      faizAzamiOran: 0.10,
      minYatirim: { bolge12: 12000000, bolge3456: 6000000 }
    },
    THP: {
      name: "Teknoloji Hamlesi Programı",
      yko: 50,
      vergiIndirimOrani: 60,
      sgkSure: {},
      faizDestegi: true,
      faizMax: 240000000,
      faizAzamiOran: 0.20,
      minYatirim: { text: "Program kapsamında çıkılan çağrıda belirlenmektedir." }
    },
    YKHP: {
      name: "Yerel Kalkınma Hamlesi Programı",
      yko: 50,
      vergiIndirimOrani: 60,
      sgkSure: { 1: 8, 2: 8, 3: 8, 4: 8, 5: 8, 6: 12 },
      faizDestegi: true,
      faizMax: 240000000,
      faizAzamiOran: 0.20,
      minYatirim: { text: "Program kapsamında yapılan çağrıda belirlenmektedir." }
    },
    SHP: {
      name: "Stratejik Hamle Programı",
      yko: 40,
      vergiIndirimOrani: 60,
      sgkSure: {},
      faizDestegi: true,
      faizMax: 180000000,
      faizAzamiOran: 0.15,
      minYatirim: { text: "Yüksek teknolojili ürünler için 100 Milyon TL, diğer yatırımlar için 200 Milyon TL'dir." }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatNumber = (value: string) => {
    const cleanValue = value.replace(/\./g, '');
    if (!isNaN(Number(cleanValue)) && cleanValue.length > 0) {
      return new Intl.NumberFormat('tr-TR').format(Number(cleanValue));
    }
    return '';
  };

  const calculateTotalInvestment = () => {
    const ithalMakine = parseInt(formData.ithalMakine.replace(/\./g, ''), 10) || 0;
    const yerliMakine = parseInt(formData.yerliMakine.replace(/\./g, ''), 10) || 0;
    const binaInsaat = parseInt(formData.binaInsaat.replace(/\./g, ''), 10) || 0;
    const digerGiderler = parseInt(formData.digerGiderler.replace(/\./g, ''), 10) || 0;
    
    const total = ithalMakine + yerliMakine + binaInsaat + digerGiderler;
    return total > 0 ? formatNumber(total.toString()) : '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalInvestment = calculateTotalInvestment();
    setFormData(prev => ({ ...prev, sabitYatirimTutari: totalInvestment }));
    
    // Rapor oluşturma mantığı
    const report = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0732ef; border-bottom: 2px solid #0732ef; padding-bottom: 10px;">
          YATIRIM TEŞVİK RAPORU
        </h2>
        
        <h3 style="color: #517a06; margin-top: 30px;">A. ŞİRKET BİLGİLERİ</h3>
        <p><strong>Şirket Adı/Unvanı:</strong> ${formData.sirketAdi}</p>
        <p><strong>KOBİ Statüsü:</strong> ${formData.kobiStatusu}</p>
        <p><strong>Faaliyet Alanı:</strong> ${formData.naceSearch}</p>
        
        <h3 style="color: #517a06; margin-top: 30px;">B. YATIRIM PROJESİ BİLGİLERİ</h3>
        <p><strong>Yatırımın Türü:</strong> ${formData.yatirimTuru}</p>
        <p><strong>Mevcut İstihdam Sayısı:</strong> ${formData.mevcutIstihdam}</p>
        <p><strong>Faaliyette Bulunma Süresi:</strong> ${formData.faaliyetSuresi} yıl</p>
        <p><strong>Sağlanacak İlave İstihdam Sayısı:</strong> ${formData.ilaveIstihdam}</p>
        
        <h3 style="color: #517a06; margin-top: 30px;">C. YATIRIM MALİYETLERİ</h3>
        <p><strong>İthal Makine Teçhizat:</strong> ${formData.ithalMakine} TL</p>
        <p><strong>Yerli Makine Teçhizat:</strong> ${formData.yerliMakine} TL</p>
        <p><strong>Bina İnşaat Giderleri:</strong> ${formData.binaInsaat} TL</p>
        <p><strong>Diğer Yatırım Giderleri:</strong> ${formData.digerGiderler} TL</p>
        <p><strong>Toplam Sabit Yatırım Tutarı:</strong> ${calculateTotalInvestment()} TL</p>
        
        <h3 style="color: #517a06; margin-top: 30px;">D. YATIRIM LOKASYONU</h3>
        <p><strong>Yatırım Yapılacak İl:</strong> ${formData.yatirimIli}</p>
        <p><strong>Yatırım Yapılacak Bölge:</strong> ${formData.yatirimBolgesi}</p>
        <p><strong>Yatırımın Tamamlanma Süresi:</strong> ${formData.tamamlanmaSuresiAy} ay</p>
        
        <h3 style="color: #517a06; margin-top: 30px;">E. TEŞVİK PROGRAMI</h3>
        <p><strong>Seçilen Program:</strong> ${formData.ozelProgram}</p>
        ${formData.ozelProgram === 'OncelikliYatirim' ? `
          <p><strong>Öncelikli Yatırım Konusu:</strong> ${formData.oncelikliYatirimKonusu}</p>
          <p><strong>Öncelikli Ürün:</strong> ${formData.oncelikliUrun}</p>
        ` : ''}
        
        <div style="margin-top: 40px; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #0732ef;">
          <p style="margin: 0; font-style: italic;">
            Bu rapor, girilen bilgilere dayanarak oluşturulmuş bir ön değerlendirmedir. 
            Kesin teşvik miktarları ve koşulları için resmi başvuru yapılması gerekmektedir.
          </p>
        </div>
      </div>
    `;
    
    setReportContent(report);
    setShowReport(true);
  };

  return (
    <div className={`${styles.container} ${mode === 'dark' ? styles.darkMode : ''}`}>
      {/* Dark Mode Toggle Button */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1001,
          backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          }
        }}
      >
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>

      <header className={styles.header}>
        <h1 className={styles.title}>Yatırım Teşvik Raporu Oluşturucu</h1>
        <p className={styles.subtitle}>
          Proje detaylarınızı girin, potansiyel devlet destekleri için anında bir ön değerlendirme raporu alın.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* A. Şirket Bilgileri */}
        <div className={styles.formSection}>
          <h2>A. Şirket Bilgileri</h2>
          <div className={styles.grid}>
            <div>
              <label htmlFor="sirketAdi" className={styles.formLabel}>Şirket Adı/Unvanı</label>
              <input
                type="text"
                id="sirketAdi"
                className={styles.formInput}
                value={formData.sirketAdi}
                onChange={(e) => handleInputChange('sirketAdi', e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="kobiStatusu" className={styles.formLabel}>KOBİ Statüsü</label>
              <select
                id="kobiStatusu"
                className={styles.formSelect}
                value={formData.kobiStatusu}
                onChange={(e) => handleInputChange('kobiStatusu', e.target.value)}
              >
                <option value="KOBİ">KOBİ</option>
                <option value="Büyük İşletme">Büyük İşletme</option>
              </select>
            </div>
            <div className={styles.fullWidth}>
              <label htmlFor="naceSearch" className={styles.formLabel}>Faaliyet Alanı (NACE Kodu ve Açıklaması)</label>
              <input
                type="text"
                id="naceSearch"
                className={styles.formInput}
                value={formData.naceSearch}
                onChange={(e) => handleInputChange('naceSearch', e.target.value)}
                placeholder="Faaliyet alanı veya kodu ile arama yapın..."
                disabled={!!formData.naceKodu} // NACE kodu varsa disabled yap
                required
              />
            </div>
          </div>
        </div>

        {/* B. Yatırım Projesi Bilgileri */}
        <div className={styles.formSection}>
          <h2>B. Yatırım Projesi Bilgileri</h2>
          <div className={styles.grid}>
            <div>
              <label htmlFor="yatirimTuru" className={styles.formLabel}>Yatırımın Türü</label>
              <select
                id="yatirimTuru"
                className={styles.formSelect}
                value={formData.yatirimTuru}
                onChange={(e) => handleInputChange('yatirimTuru', e.target.value)}
              >
                <option value="Komple yeni yatırım">Komple yeni yatırım</option>
                <option value="Tevsi">Tevsi</option>
                <option value="Modernizasyon">Modernizasyon</option>
                <option value="Ürün çeşitlendirme">Ürün çeşitlendirme</option>
                <option value="Entegrasyon">Entegrasyon</option>
                <option value="Nakil">Nakil</option>
              </select>
            </div>
            <div>
              <label htmlFor="mevcutIstihdam" className={styles.formLabel}>Mevcut İstihdam Sayısı</label>
              <input
                type="number"
                id="mevcutIstihdam"
                className={styles.formInput}
                value={formData.mevcutIstihdam}
                onChange={(e) => handleInputChange('mevcutIstihdam', e.target.value)}
                min="0"
                disabled={formData.yatirimTuru === 'Komple yeni yatırım'}
                required
              />
            </div>
            <div>
              <label htmlFor="faaliyetSuresi" className={styles.formLabel}>Faaliyette Bulunma Süresi (Yıl)</label>
              <input
                type="number"
                id="faaliyetSuresi"
                className={styles.formInput}
                value={formData.faaliyetSuresi}
                onChange={(e) => handleInputChange('faaliyetSuresi', e.target.value)}
                min="0"
                disabled={formData.yatirimTuru === 'Komple yeni yatırım'}
                required
              />
            </div>
            <div>
              <label htmlFor="ilaveIstihdam" className={styles.formLabel}>Sağlanacak İlave İstihdam Sayısı</label>
              <input
                type="number"
                id="ilaveIstihdam"
                className={styles.formInput}
                value={formData.ilaveIstihdam}
                onChange={(e) => handleInputChange('ilaveIstihdam', e.target.value)}
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="ithalMakine" className={styles.formLabel}>İthal Makine Teçhizat (TL)</label>
              <input
                type="text"
                id="ithalMakine"
                className={styles.formInput}
                value={formData.ithalMakine}
                onChange={(e) => {
                  const formatted = formatNumber(e.target.value);
                  handleInputChange('ithalMakine', formatted);
                }}
              />
            </div>
            <div>
              <label htmlFor="yerliMakine" className={styles.formLabel}>Yerli Makine Teçhizat (TL)</label>
              <input
                type="text"
                id="yerliMakine"
                className={styles.formInput}
                value={formData.yerliMakine}
                onChange={(e) => {
                  const formatted = formatNumber(e.target.value);
                  handleInputChange('yerliMakine', formatted);
                }}
              />
            </div>
            <div>
              <label htmlFor="binaInsaat" className={styles.formLabel}>Bina İnşaat Giderleri (TL)</label>
              <input
                type="text"
                id="binaInsaat"
                className={styles.formInput}
                value={formData.binaInsaat}
                onChange={(e) => {
                  const formatted = formatNumber(e.target.value);
                  handleInputChange('binaInsaat', formatted);
                }}
              />
            </div>
            <div>
              <label htmlFor="digerGiderler" className={styles.formLabel}>Diğer Yatırım Giderleri (TL)</label>
              <input
                type="text"
                id="digerGiderler"
                className={styles.formInput}
                value={formData.digerGiderler}
                onChange={(e) => {
                  const formatted = formatNumber(e.target.value);
                  handleInputChange('digerGiderler', formatted);
                }}
                placeholder="Nakliye, gümrükleme vb."
              />
            </div>

            <div className={styles.fullWidth}>
              <label htmlFor="sabitYatirimTutari" className={styles.formLabel}>Toplam Sabit Yatırım Tutarı (TL)</label>
              <input
                type="text"
                id="sabitYatirimTutari"
                className={`${styles.formInput} ${styles.totalInput}`}
                value={calculateTotalInvestment()}
                disabled
                readOnly
              />
            </div>

            <div>
              <label htmlFor="yatirimIli" className={styles.formLabel}>Yatırım Yapılacak İl</label>
              <select
                id="yatirimIli"
                className={styles.formSelect}
                value={formData.yatirimIli}
                onChange={(e) => handleInputChange('yatirimIli', e.target.value)}
                required
              >
                <option value="">Lütfen İl Seçin</option>
                {Object.keys(ilBolgeMap).sort((a, b) => a.localeCompare(b, 'tr')).map(il => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="yatirimBolgesi" className={styles.formLabel}>Yatırım Yapılacak Bölge</label>
              <select
                id="yatirimBolgesi"
                className={styles.formSelect}
                value={formData.yatirimBolgesi}
                onChange={(e) => handleInputChange('yatirimBolgesi', e.target.value)}
                disabled
              >
                <option value="1">1. Bölge</option>
                <option value="2">2. Bölge</option>
                <option value="3">3. Bölge</option>
                <option value="4">4. Bölge</option>
                <option value="5">5. Bölge</option>
                <option value="6">6. Bölge</option>
              </select>
            </div>
            <div>
              <label htmlFor="tamamlanmaSuresiAy" className={styles.formLabel}>Yatırımın Tamamlanma Süresi (Ay)</label>
              <input
                type="number"
                id="tamamlanmaSuresiAy"
                className={styles.formInput}
                value={formData.tamamlanmaSuresiAy}
                onChange={(e) => handleInputChange('tamamlanmaSuresiAy', e.target.value)}
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* C. Program Seçimi */}
        <div className={styles.formSection}>
          <h2>Yatırım Teşvik Belgesi Programı Kapsamı</h2>
          <p className={styles.description}>
            Projeniz aşağıdaki programlardan hangisi kapsamında değerlendirilebilir?
          </p>
          
          <h3>Sektörel ve Bölgesel Teşvik Sistemi</h3>
          <div className={styles.radioGroup}>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="HedefYatirim"
                checked={formData.ozelProgram === 'HedefYatirim'}
                onChange={(e) => handleInputChange('ozelProgram', e.target.value)}
              />
              <span>Hedef Yatırımlar Teşvik Sistemi</span>
            </label>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="OncelikliYatirim"
                checked={formData.ozelProgram === 'OncelikliYatirim'}
                onChange={(e) => handleInputChange('ozelProgram', e.target.value)}
              />
              <span>Öncelikli Yatırımlar Teşvik Sistemi</span>
            </label>
          </div>

          <h3>Türkiye Yüzyılı Kalkınma Hamlesi</h3>
          <div className={styles.radioGroup}>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="THP"
                checked={formData.ozelProgram === 'THP'}
                onChange={(e) => handleInputChange('ozelProgram', e.target.value)}
              />
              <span>Teknoloji Hamlesi Programı</span>
            </label>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="YKHP"
                checked={formData.ozelProgram === 'YKHP'}
                onChange={(e) => handleInputChange('ozelProgram', e.target.value)}
              />
              <span>Yerel Kalkınma Hamlesi Programı</span>
            </label>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="SHP"
                checked={formData.ozelProgram === 'SHP'}
                onChange={(e) => handleInputChange('ozelProgram', e.target.value)}
              />
              <span>Stratejik Hamle Programı</span>
            </label>
          </div>
          
          <h3>Yeşil ve Dijital Dönüşüm</h3>
          <div className={styles.radioGroup}>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="DDP"
                checked={formData.ozelProgram === 'DDP'}
                onChange={(e) => handleInputChange('ozelProgram', e.target.value)}
              />
              <span>Dijital Dönüşüm Programı (DDP)</span>
            </label>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="YDP"
                checked={formData.ozelProgram === 'YDP'}
                onChange={(e) => handleInputChange('ozelProgram', e.target.value)}
              />
              <span>Yeşil Dönüşüm Programı (YDP)</span>
            </label>
          </div>

          {/* Öncelikli Yatırım Detayları */}
          {formData.ozelProgram === 'OncelikliYatirim' && (
            <div className={styles.additionalInputs}>
              <h3 className={styles.additionalTitle}>Öncelikli Yatırım Konusu Detayları</h3>
              <label htmlFor="oncelikliYatirimKonusu" className={styles.formLabel}>Lütfen Yatırım Konusunu Seçiniz</label>
              <select
                id="oncelikliYatirimKonusu"
                className={styles.formSelect}
                value={formData.oncelikliYatirimKonusu}
                onChange={(e) => handleInputChange('oncelikliYatirimKonusu', e.target.value)}
              >
                <option value="">Seçiniz</option>
                {Object.entries(oncelikliYatirimKonulari).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          )}

          {/* THP Detayları */}
          {formData.ozelProgram === 'THP' && (
            <div className={styles.additionalInputs}>
              <h3 className={styles.additionalTitle}>Teknoloji Hamlesi Programı Detayları</h3>
              <label htmlFor="oncelikliUrun" className={styles.formLabel}>Öncelikli Ürün Listesi'ndeki Ürün Adı</label>
              <input
                type="text"
                id="oncelikliUrun"
                className={styles.formInput}
                value={formData.oncelikliUrun}
                onChange={(e) => handleInputChange('oncelikliUrun', e.target.value)}
                placeholder="Örn: Biyoteknolojik İlaç"
              />
            </div>
          )}
        </div>
        
        <div className={styles.submitContainer}>
          <button type="submit" className={styles.submitButton}>
            Rapor Oluştur
          </button>
        </div>
      </form>

      {showReport && (
        <div className={styles.reportContainer}>
          <div className={styles.reportContent}>
            <div className={styles.reportHeader}>
              <h2>Yatırım Teşvik Ön Değerlendirme Raporu</h2>
            </div>
            <div className={styles.reportOutput}>
              {reportContent}
            </div>
          </div>
          <div className={styles.downloadContainer}>
            <button className={styles.downloadButton}>
              PDF Olarak İndir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
