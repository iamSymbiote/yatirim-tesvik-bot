"use client";
import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import styles from './page.module.css';
import destekUnsurlariBolgeBazli from '@/data/destekUnsurlariBolgeBazli.json';
import { generateAndDownloadPDF as generateAndDownloadPDFNew } from '@/components/PDFReportNew';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function DetayliAnalizContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [formData, setFormData] = useState({
    sirketAdi: '',
    kobiStatusu: '', // Zorunlu alan - boş başlat
    naceKodu: '',
    naceSearch: '',
    yatirimTuru: '', // Zorunlu alan - boş başlat
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
    sektorelProgram: 'HedefYatirim',
    ozelProgram: '', // Türkiye Yüzyılı Kalkınma Hamlesi
    dijitalProgram: '', // Yeşil ve Dijital Dönüşüm
    oncelikliUrun: '',
    oncelikliYatirimKonusu: '',
    // Teşvik programı verileri
    hedefYatirim: false,
    oncelikliYatirim: false,
    yuksekTeknoloji: false,
    ortaYuksekTeknoloji: false
  });

  const [showReport, setShowReport] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const reportRef = useRef<HTMLDivElement | null>(null);

  // Rapor oluşturulduğunda otomatik olarak rapor bölümüne kaydır
  useEffect(() => {
    if (showReport && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showReport]);

  // Link okundu durumları için state
  const [readLinks, setReadLinks] = useState({
    THP: false,
    YKHP: false,
    SHP: false
  });

  // Form validasyon hataları için state
  const [validationErrors, setValidationErrors] = useState({
    sirketAdi: false,
    kobiStatusu: false,
    ilaveIstihdam: false,
    tamamlanmaSuresiAy: false,
    tamamlanmaSuresiAyMax: false, // 54 ay limiti için
    yatirimTuru: false
  });

  const toggleTheme = () => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      // Body background'ını da değiştir
      document.body.style.backgroundColor = newMode === 'dark' ? '#1a1a1a' : '#ffffff';
      return newMode;
    });
  };

  const exportReportAsPDF = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth - 20; // 10mm margin on both sides
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight - 20;
    while (heightLeft > 0) {
      pdf.addPage();
      position = 10 - (imgHeight - heightLeft);
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight - 20;
    }
    pdf.save(`yatirim-tesvik-raporu-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // URL parametrelerini oku ve form verilerini güncelle
  useEffect(() => {
    const naceKodu = searchParams.get('naceKodu');
    const naceAciklama = searchParams.get('naceAciklama');
    const il = searchParams.get('yatirimIli') || searchParams.get('il'); // Geriye dönük uyumluluk için
    const ilce = searchParams.get('yatirimIlcesi') || searchParams.get('ilce'); // Geriye dönük uyumluluk için
    const osb = searchParams.get('osb');
    const yatirimBolgesi = searchParams.get('yatirimBolgesi');
    const faydalanacakBolge = searchParams.get('destekBolgesi') || searchParams.get('faydalanacakBolge'); // Geriye dönük uyumluluk için
    
    // Teşvik programı verilerini oku
    const hedefYatirim = searchParams.get('hedefYatirim') === 'true';
    const oncelikliYatirim = searchParams.get('oncelikliYatirim') === 'true';
    const yuksekTeknoloji = searchParams.get('yuksekTeknoloji') === 'true';
    const ortaYuksekTeknoloji = searchParams.get('ortaYuksekTeknoloji') === 'true';
    
    
    if (naceKodu) {
      const aciklama = naceAciklama && naceAciklama !== 'undefined' ? naceAciklama : 'Açıklama bulunamadı';
      
      // Öncelikli yatırım varsa onu seç, yoksa hedef yatırımı seç
      let selectedSektorelProgram = '';
      if (oncelikliYatirim) {
        selectedSektorelProgram = 'OncelikliYatirim';
      } else if (hedefYatirim) {
        selectedSektorelProgram = 'HedefYatirim';
      }
      // Eğer ikisi de false ise, varsayılan olarak HedefYatirim seç
      if (!selectedSektorelProgram) {
        selectedSektorelProgram = 'HedefYatirim';
      }
      
      
      setFormData(prev => ({
        ...prev,
        naceKodu: naceKodu,
        naceSearch: `${naceKodu} - ${aciklama}`,
        yatirimIli: il || '',
        yatirimIlcesi: ilce || '',
        yatirimBolgesi: yatirimBolgesi || faydalanacakBolge || '',
        // Teşvik programı verileri
        hedefYatirim: hedefYatirim,
        oncelikliYatirim: oncelikliYatirim,
        yuksekTeknoloji: yuksekTeknoloji,
        ortaYuksekTeknoloji: ortaYuksekTeknoloji,
        sektorelProgram: selectedSektorelProgram
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
      minYatirim: { bolge12: 15100000, bolge3456: 7500000 }
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
      minYatirim: { bolge12: 15100000, bolge3456: 7500000 }
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
    
    // Tamamlanma süresi için özel kontrol
    if (field === 'tamamlanmaSuresiAy') {
      const numValue = parseInt(value);
      const isOverLimit = !isNaN(numValue) && numValue > 54;
      
      setValidationErrors(prev => ({
        ...prev,
        tamamlanmaSuresiAy: !value.trim(),
        tamamlanmaSuresiAyMax: isOverLimit
      }));
      return;
    }
    
    // Eğer bu field validasyon hatası veriyorsa, hatayı temizle
    if (field in validationErrors && validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleRadioToggle = (field: keyof typeof formData, option: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field] === option ? '' : option
    }));
  };

  const handleRadioClickToggle = (field: keyof typeof formData, option: string) => {
    setFormData(prev => {
      if ((prev as any)[field] === option) {
        return { ...prev, [field]: '' };
      }
      return prev;
    });
  };

  // Link tıklama fonksiyonu
  const handleLinkClick = (programType: 'THP' | 'YKHP' | 'SHP') => {
    setReadLinks(prev => ({
      ...prev,
      [programType]: true
    }));
  };

  // Form validasyon fonksiyonu
  const validateForm = () => {
    const numValue = parseInt(formData.tamamlanmaSuresiAy);
    const isOverLimit = !isNaN(numValue) && numValue > 54;
    
    const errors = {
      sirketAdi: !formData.sirketAdi.trim(),
      kobiStatusu: !formData.kobiStatusu,
      ilaveIstihdam: !formData.ilaveIstihdam.trim(),
      tamamlanmaSuresiAy: !formData.tamamlanmaSuresiAy.trim(),
      tamamlanmaSuresiAyMax: isOverLimit,
      yatirimTuru: !formData.yatirimTuru
    };
    
    console.log('Form Data:', formData);
    console.log('Validation Errors:', errors);
    
    setValidationErrors(errors);
    
    // Eğer herhangi bir hata varsa false döndür
    const hasErrors = Object.values(errors).some(error => error);
    console.log('Has Errors:', hasErrors);
    return !hasErrors;
  };

  const formatNumber = (value: string) => {
    const cleanValue = value.replace(/\./g, '');
    if (!isNaN(Number(cleanValue)) && cleanValue.length > 0) {
      return new Intl.NumberFormat('tr-TR').format(Number(cleanValue));
    }
    return '';
  };

  const getAsgariTutarText = () => {
    const bolgeNum = parseInt(formData.yatirimBolgesi || '0', 10);
    const cfg = programConfigs[formData.sektorelProgram as keyof typeof programConfigs];
    if (!cfg) return '-';
    if ('minYatirim' in cfg && cfg.minYatirim) {
      const key = bolgeNum === 1 || bolgeNum === 2 ? 'bolge12' : 'bolge3456';
      const amount = (cfg.minYatirim as any)[key];
      if (!amount) return '-';
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
    }
    // Text tabanlı olanlar için
    // @ts-ignore
    if (cfg.minYatirim?.text) return cfg.minYatirim.text as string;
    return '-';
  };

  const calculateTotalInvestment = () => {
    const ithalMakine = parseInt(formData.ithalMakine.replace(/\./g, ''), 10) || 0;
    const yerliMakine = parseInt(formData.yerliMakine.replace(/\./g, ''), 10) || 0;
    const binaInsaat = parseInt(formData.binaInsaat.replace(/\./g, ''), 10) || 0;
    const digerGiderler = parseInt(formData.digerGiderler.replace(/\./g, ''), 10) || 0;
    
    const total = ithalMakine + yerliMakine + binaInsaat + digerGiderler;
    return total > 0 ? formatNumber(total.toString()) : '';
  };

  const buildReportHTML = () => {
    const toplam = calculateTotalInvestment();
    const bolgeLabel = formData.yatirimBolgesi ? `${formData.yatirimBolgesi}. Bölge` : '-';
    const bolgeKey = `${bolgeLabel}` as keyof typeof destekUnsurlariBolgeBazli;
    const destekList: Array<{ ad: string; aciklama?: string; deger?: string }> =
      (destekUnsurlariBolgeBazli as any)[bolgeKey] || [];

    const destekHTML = destekList
      .map(d => `
        <li style="margin-bottom:8px;">
          <strong>${d.ad}:</strong> <span>${d.deger || ''}</span>
          ${d.aciklama ? `<div style=\"color:#505a6b; font-size:13px; margin-top:4px;\">${d.aciklama}</div>` : ''}
        </li>
      `)
      .join('');

    const uygunlukBadge = (v: boolean) => `<span style="padding:2px 8px; border-radius:12px; font-weight:600; color:${v ? '#166534' : '#991b1b'}; background:${v ? '#dcfce7' : '#fee2e2'};">${v ? 'Evet' : 'Hayır'}</span>`;

    return `
      <div style="font-family: Inter, Arial, sans-serif; line-height:1.6; color:#0f172a;">
        <h2 style="color:#0732ef; border-bottom:2px solid #0732ef; padding-bottom:10px;">YATIRIM TEŞVİK RAPORU</h2>

        <h3 style="color:#0369a1; margin-top:24px;">A. ŞİRKET BİLGİLERİ</h3>
        <p><strong>Şirket Adı/Unvanı:</strong> ${formData.sirketAdi}</p>
        <p><strong>KOBİ Statüsü:</strong> ${formData.kobiStatusu}</p>
        <p><strong>Faaliyet Alanı:</strong> ${formData.naceSearch}</p>

        <h3 style="color:#0369a1; margin-top:24px;">B. YATIRIM PROJESİ BİLGİLERİ</h3>
        <p><strong>Yatırımın Türü:</strong> ${formData.yatirimTuru}</p>
        <p><strong>Mevcut İstihdam Sayısı:</strong> ${formData.mevcutIstihdam || '-'}</p>
        <p><strong>Faaliyette Bulunma Süresi:</strong> ${formData.faaliyetSuresi || '-'} yıl</p>
        <p><strong>Sağlanacak İlave İstihdam:</strong> ${formData.ilaveIstihdam}</p>

        <h3 style="color:#0369a1; margin-top:24px;">C. YATIRIM MALİYETLERİ</h3>
        <p><strong>İthal Makine Teçhizat:</strong> ${formData.ithalMakine || '-'} TL</p>
        <p><strong>Yerli Makine Teçhizat:</strong> ${formData.yerliMakine || '-'} TL</p>
        <p><strong>Bina İnşaat Giderleri:</strong> ${formData.binaInsaat || '-'} TL</p>
        <p><strong>Diğer Yatırım Giderleri:</strong> ${formData.digerGiderler || '-'} TL</p>
        <p style="font-size:18px; margin-top:8px;"><strong>Toplam Sabit Yatırım:</strong> ${toplam || '-'} TL</p>

        <h3 style="color:#0369a1; margin-top:24px;">D. YATIRIM LOKASYONU</h3>
        <p><strong>İl:</strong> ${formData.yatirimIli || '-'}</p>
        <p><strong>Bölge:</strong> ${bolgeLabel}</p>
        <p><strong>Yatırımın Tamamlanma Süresi:</strong> ${formData.tamamlanmaSuresiAy} ay</p>

        <h3 style="color:#0369a1; margin-top:24px;">E. UYGUNLUK ÖZETİ</h3>
        <ul style="list-style:none; padding:0;">
          <li style="margin-bottom:6px;"><strong>Hedef Yatırım:</strong> ${uygunlukBadge(!!formData.hedefYatirim)}</li>
          <li style="margin-bottom:6px;"><strong>Öncelikli Yatırım:</strong> ${uygunlukBadge(!!formData.oncelikliYatirim)}</li>
          <li style="margin-bottom:6px;"><strong>Yüksek Teknoloji:</strong> ${uygunlukBadge(!!formData.yuksekTeknoloji)}</li>
          <li style="margin-bottom:6px;"><strong>Orta-Yüksek Teknoloji:</strong> ${uygunlukBadge(!!formData.ortaYuksekTeknoloji)}</li>
        </ul>

        <h3 style="color:#0369a1; margin-top:24px;">F. DESTEK UNSURLARI (${bolgeLabel})</h3>
        <ul style="padding-left:18px;">${destekHTML || '<li>Veri bulunamadı</li>'}</ul>

        <div style="margin-top:24px; padding:14px; background:#f1f5f9; border-left:4px solid #0732ef; color:#334155;">
          Bu rapor, ana sayfa sorgusundan aktarılan kriterler ve bu sayfada sağlanan bilgilerle otomatik oluşturulmuştur. Nihai karar ve tutarlar için resmi başvuru gerekir.
        </div>
      </div>
    `;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonunu kontrol et
    if (!validateForm()) {
      // Sayfayı en üste kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const totalInvestment = calculateTotalInvestment();
    setFormData(prev => ({ ...prev, sabitYatirimTutari: totalInvestment }));
    
    // Rapor oluşturma mantığı
    const report = buildReportHTML();
    
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
              <label htmlFor="sirketAdi" className={styles.formLabel}>Şirket Adı/Unvanı *</label>
              <input
                type="text"
                id="sirketAdi"
                className={`${styles.formInput} ${validationErrors.sirketAdi ? styles.errorInput : ''}`}
                value={formData.sirketAdi}
                onChange={(e) => handleInputChange('sirketAdi', e.target.value)}
              />
              {validationErrors.sirketAdi && (
                <div className={styles.errorMessage}>Bu alan zorunludur</div>
              )}
            </div>
            <div>
              <label htmlFor="kobiStatusu" className={styles.formLabel}>KOBİ Statüsü *</label>
              <select
                id="kobiStatusu"
                className={`${styles.formSelect} ${validationErrors.kobiStatusu ? styles.errorInput : ''}`}
                value={formData.kobiStatusu}
                onChange={(e) => handleInputChange('kobiStatusu', e.target.value)}
              >
                <option value="">Seçiniz</option>
                <option value="KOBİ">KOBİ</option>
                <option value="Büyük İşletme">Büyük İşletme</option>
              </select>
              {validationErrors.kobiStatusu && (
                <div className={styles.errorMessage}>Bu alan zorunludur</div>
              )}
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
              />
            </div>
          </div>
        </div>

        {/* B. Yatırım Projesi Bilgileri */}
        <div className={styles.formSection}>
          <h2>B. Yatırım Projesi Bilgileri</h2>
          <div className={styles.grid}>
            <div>
              <label htmlFor="yatirimTuru" className={styles.formLabel}>Yatırımın Türü *</label>
              <select
                id="yatirimTuru"
                className={`${styles.formSelect} ${validationErrors.yatirimTuru ? styles.errorInput : ''}`}
                value={formData.yatirimTuru}
                onChange={(e) => handleInputChange('yatirimTuru', e.target.value)}
              >
                <option value="">Seçiniz</option>
                <option value="Komple yeni yatırım">Komple yeni yatırım</option>
                <option value="Tevsi">Tevsi</option>
                <option value="Modernizasyon">Modernizasyon</option>
                <option value="Ürün çeşitlendirme">Ürün çeşitlendirme</option>
                <option value="Entegrasyon">Entegrasyon</option>
                <option value="Nakil">Nakil</option>
              </select>
              {validationErrors.yatirimTuru && (
                <div className={styles.errorMessage}>Bu alan zorunludur</div>
              )}
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
              />
            </div>
            <div>
              <label htmlFor="ilaveIstihdam" className={styles.formLabel}>Sağlanacak İlave İstihdam Sayısı *</label>
              <input
                type="number"
                id="ilaveIstihdam"
                className={`${styles.formInput} ${validationErrors.ilaveIstihdam ? styles.errorInput : ''}`}
                value={formData.ilaveIstihdam}
                onChange={(e) => handleInputChange('ilaveIstihdam', e.target.value)}
                min="0"
              />
              {validationErrors.ilaveIstihdam && (
                <div className={styles.errorMessage}>Bu alan zorunludur</div>
              )}
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
                disabled={!!formData.yatirimIli}
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
              <label htmlFor="tamamlanmaSuresiAy" className={styles.formLabel}>Yatırımın Tamamlanma Süresi (Ay) *</label>
              <input
                type="number"
                id="tamamlanmaSuresiAy"
                className={`${styles.formInput} ${(validationErrors.tamamlanmaSuresiAy || validationErrors.tamamlanmaSuresiAyMax) ? styles.errorInput : ''}`}
                value={formData.tamamlanmaSuresiAy}
                onChange={(e) => handleInputChange('tamamlanmaSuresiAy', e.target.value)}
                min="1"
                max="54"
              />
              {validationErrors.tamamlanmaSuresiAy && (
                <div className={styles.errorMessage}>Bu alan zorunludur</div>
              )}
              {validationErrors.tamamlanmaSuresiAyMax && (
                <div className={styles.errorMessage}>Tamamlanma süresi 54 aydan fazla olamaz</div>
              )}
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
          
          {/* Ana sorgudan gelen sonuca göre bilgilendirme */}
          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div className={styles.infoText}>
              <strong>Bu bölüm ana sayfadaki sorgu sonucuna göre otomatik belirlenmiştir.</strong>
              <br />
              {formData.oncelikliYatirim ? (
                <>Bu NACE kodu <strong>Öncelikli Yatırım</strong> kapsamında olduğu için otomatik seçilmiştir.</>
              ) : formData.hedefYatirim ? (
                <>Bu NACE kodu <strong>Hedef Yatırım</strong> kapsamında olduğu için otomatik seçilmiştir.</>
              ) : (
                <>Bu NACE kodu için varsayılan olarak <strong>Hedef Yatırım</strong> sistemi seçilmiştir.</>
              )}
            </div>
          </div>
          
          <div className={styles.radioGroup}>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="sektorelProgram"
                value="HedefYatirim"
                checked={formData.sektorelProgram === 'HedefYatirim'}
                onChange={(e) => handleInputChange('sektorelProgram', e.target.value)}
                disabled={true}
              />
              <span>Hedef Yatırımlar Teşvik Sistemi</span>
            </label>
            
            {/* Hedef Yatırım Tooltip */}
            {formData.sektorelProgram === 'HedefYatirim' && (
              <div className={styles.tooltipBox}>
                <div className={styles.tooltipIcon}>💡</div>
                <div className={styles.tooltipText}>
                  <strong>Otomatik Seçim:</strong> Yatırımınız hedef yatırım kapsamında değerlendirileceği için bu seçenek sorgunuz sonrasında otomatik gelmiştir ve değiştirilemez.
                </div>
              </div>
            )}
            
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="sektorelProgram"
                value="OncelikliYatirim"
                checked={formData.sektorelProgram === 'OncelikliYatirim'}
                onChange={(e) => handleInputChange('sektorelProgram', e.target.value)}
                disabled={true}
              />
              <span>Öncelikli Yatırımlar Teşvik Sistemi</span>
            </label>
            
            {/* Öncelikli Yatırım Tooltip */}
            {formData.sektorelProgram === 'OncelikliYatirim' && (
              <div className={styles.tooltipBox}>
                <div className={styles.tooltipIcon}>💡</div>
                <div className={styles.tooltipText}>
                  <strong>Otomatik Seçim:</strong> Yatırımınız öncelikli konusunda değerlendirildiği için bu seçenek sorgunuz sonrasında otomatik gelmiştir ve değiştirilemez.
                </div>
              </div>
            )}
          </div>

          <h3>Türkiye Yüzyılı Kalkınma Hamlesi</h3>
          <div className={styles.radioGroup}>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="THP"
                checked={formData.ozelProgram === 'THP'}
                onChange={() => handleRadioToggle('ozelProgram', 'THP')}
                onClick={() => handleRadioClickToggle('ozelProgram', 'THP')}
              />
              <span>Teknoloji Hamlesi Programı</span>
            </label>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="YKHP"
                checked={formData.ozelProgram === 'YKHP'}
                onChange={() => handleRadioToggle('ozelProgram', 'YKHP')}
                onClick={() => handleRadioClickToggle('ozelProgram', 'YKHP')}
              />
              <span>Yerel Kalkınma Hamlesi Programı</span>
            </label>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="ozelProgram"
                value="SHP"
                checked={formData.ozelProgram === 'SHP'}
                onChange={() => handleRadioToggle('ozelProgram', 'SHP')}
                onClick={() => handleRadioClickToggle('ozelProgram', 'SHP')}
              />
              <span>Stratejik Hamle Programı</span>
            </label>
          </div>

          {/* Program Detay Linki ve Uyarı Mesajı */}
          {(formData.ozelProgram === 'THP' || formData.ozelProgram === 'YKHP' || formData.ozelProgram === 'SHP') && (
            <div className={styles.programInfoBox}>
              <div className={styles.warningIcon}>⚠️</div>
              <div className={styles.warningText}>
                <strong>Rapor oluşturmadan önce seçtiğiniz programın detaylarını içeren linki lütfen inceleyiniz:</strong>
                <br />
                {formData.ozelProgram === 'THP' && (
                  <a 
                    href="https://www.yatirimtesvikbelgesi.com/post/teknoloji-odaklı-sanayi-hamlesi-programı-yatırım-teşvikleri-ve-dikkat-edilmesi-gerekenler" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.programLink}
                    onClick={() => handleLinkClick('THP')}
                  >
                    📋 Teknoloji Hamlesi Programı Detayları
                    {readLinks.THP && <span style={{ marginLeft: '8px', color: '#4CAF50' }}>✅ Okundu</span>}
                  </a>
                )}
                {formData.ozelProgram === 'YKHP' && (
                  <a 
                    href="https://www.yatirimtesvikbelgesi.com/post/yerel-kalkınma-hamlesi-yatırım-teşvik-belgesi" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.programLink}
                    onClick={() => handleLinkClick('YKHP')}
                  >
                    📋 Yerel Kalkınma Hamlesi Programı Detayları
                    {readLinks.YKHP && <span style={{ marginLeft: '8px', color: '#4CAF50' }}>✅ Okundu</span>}
                  </a>
                )}
                {formData.ozelProgram === 'SHP' && (
                  <a 
                    href="https://www.yatirimtesvikbelgesi.com/post/stratejik-yatırım-teşvik-belgesi" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.programLink}
                    onClick={() => handleLinkClick('SHP')}
                  >
                    📋 Stratejik Hamle Programı Detayları
                    {readLinks.SHP && <span style={{ marginLeft: '8px', color: '#4CAF50' }}>✅ Okundu</span>}
                  </a>
                )}
              </div>
            </div>
          )}
          
          <h3>Yeşil ve Dijital Dönüşüm</h3>
          <div className={styles.radioGroup}>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="dijitalProgram"
                value="DDP"
                checked={formData.dijitalProgram === 'DDP'}
                onChange={(e) => handleInputChange('dijitalProgram', e.target.value)}
              />
              <span>Dijital Dönüşüm Programı (DDP)</span>
            </label>
            <label className={styles.customRadio}>
              <input
                type="radio"
                name="dijitalProgram"
                value="YDP"
                checked={formData.dijitalProgram === 'YDP'}
                onChange={(e) => handleInputChange('dijitalProgram', e.target.value)}
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
          <div className={styles.reportContent} ref={reportRef}>
            <div className={styles.reportHeader}>
              <h2>Yatırım Teşvik Ön Değerlendirme Raporu</h2>
            </div>
            <div className={styles.reportOutput}>
              {/* Render the generated HTML as formatted content */}
              <div dangerouslySetInnerHTML={{ __html: reportContent }} />
            </div>
          </div>
          <div className={styles.downloadContainer}>
          <button
            className={styles.downloadButton}
            onClick={exportReportAsPDF}
          >
              PDF Olarak İndir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetayliAnaliz() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetayliAnalizContent />
    </Suspense>
  );
}
