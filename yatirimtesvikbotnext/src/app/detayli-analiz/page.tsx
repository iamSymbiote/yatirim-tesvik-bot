"use client";
import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { IconButton, Modal, Box, Typography, Button } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import styles from './page.module.css';
import destekUnsurlariBolgeBazli from '@/data/destekUnsurlariBolgeBazli.json';
import naceList from '@/data/nace.json';

// NOT: Aşağıdaki importlar ve ilgili fonksiyonlar şu an aktif olarak kullanılmıyor.
// İleride PDF / JSON indirme fonksiyonlarını tekrar açmak istediğimizde
// kolayca geri dönebilmek için burada yorum satırı olarak tutuluyor.
//
// import { generateAndDownloadPDF as generateAndDownloadPDFNew } from '@/components/PDFReportNew';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

function DetayliAnalizContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [formData, setFormData] = useState({
    sirketAdi: '',
    kobiStatusu: '', // Zorunlu alan - boş başlat
    naceKodu: '',
    naceAciklama: '', // nace.json lookup veya URL'den; rapor/API için
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [apiDownloadUrl, setApiDownloadUrl] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Loading veya rapor görününce otomatik aşağı kaydır
  useEffect(() => {
    if ((isLoading || showReport) && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading, showReport]);

  // Progress 100% oldu VE API'den link geldiyse → loading'i kes, success + link göster
  useEffect(() => {
    if (loadingProgress >= 100 && apiDownloadUrl) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setDownloadUrl(apiDownloadUrl);
      setShowReport(true);
      setIsLoading(false);
      setApiDownloadUrl(null);
    }
  }, [loadingProgress, apiDownloadUrl]);

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

  // URL parametrelerini oku ve form verilerini güncelle
  useEffect(() => {
    // Kısa parametre isimleri (yeni) + geriye dönük uyumluluk için eski parametreler
    const naceKodu = searchParams.get('n') || searchParams.get('naceKodu');
    const naceAciklama = searchParams.get('na') || searchParams.get('naceAciklama');
    const il = searchParams.get('il') || searchParams.get('yatirimIli');
    const ilce = searchParams.get('ilc') || searchParams.get('yatirimIlcesi');
    const osb = searchParams.get('o') || searchParams.get('osb');
    const yatirimBolgesi = searchParams.get('yb') || searchParams.get('yatirimBolgesi');
    const faydalanacakBolge = searchParams.get('db') || searchParams.get('destekBolgesi') || searchParams.get('faydalanacakBolge');
    
    // Teşvik programı verilerini oku - kısa parametreler (1) veya eski format (true)
    const hedefYatirim = searchParams.get('hy') === '1' || searchParams.get('hedefYatirim') === 'true';
    const oncelikliYatirim = searchParams.get('oy') === '1' || searchParams.get('oncelikliYatirim') === 'true';
    const yuksekTeknoloji = searchParams.get('yt') === '1' || searchParams.get('yuksekTeknoloji') === 'true';
    const ortaYuksekTeknoloji = searchParams.get('oyt') === '1' || searchParams.get('ortaYuksekTeknoloji') === 'true';
    
    
    if (naceKodu) {
      let aciklama = naceAciklama && naceAciklama !== 'undefined' ? naceAciklama : '';
      if (!aciklama) {
        const found = (naceList as { kod: string; tanim: string }[]).find(
          (n) => n.kod === naceKodu
        );
        aciklama = found?.tanim || 'Açıklama bulunamadı';
      }
      
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
        naceAciklama: aciklama,
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
    
    setValidationErrors(errors);
    const hasErrors = Object.values(errors).some(error => error);
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
    // @ts-expect-error -- bazı config varyantlarında minYatirim nesnesi `text` alanı içeriyor (union tip), burada güvenli erişim yapıyoruz
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

  /**
   * GEÇİCİ OLARAK PASİF ALINAN FONKSİYONLAR
   * --------------------------------------
   * Aşağıdaki PDF ve JSON export fonksiyonları şu an kullanılmıyor.
   * İleride tekrar ihtiyaç duyduğumuzda, bu bloğu yorumdan çıkarıp
   * butonları JSX tarafına geri eklememiz yeterli olacak.
   */
  /*
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

  const exportReportAsJSON = () => {
    const toplam = calculateTotalInvestment();
    const bolgeLabel = formData.yatirimBolgesi ? `${formData.yatirimBolgesi}. Bölge` : '-';
    const bolgeKey = `${bolgeLabel}` as keyof typeof destekUnsurlariBolgeBazli;
    const destekList: Array<{ ad: string; aciklama?: string; deger?: string }> =
      (destekUnsurlariBolgeBazli as any)[bolgeKey] || [];

    // Sayısal değerleri hesapla
    const ithalMakine = parseInt(formData.ithalMakine.replace(/\./g, ''), 10) || 0;
    const yerliMakine = parseInt(formData.yerliMakine.replace(/\./g, ''), 10) || 0;
    const binaInsaat = parseInt(formData.binaInsaat.replace(/\./g, ''), 10) || 0;
    const digerGiderler = parseInt(formData.digerGiderler.replace(/\./g, ''), 10) || 0;
    const toplamYatirim = ithalMakine + yerliMakine + binaInsaat + digerGiderler;

    // Aktif program bilgilerini al
    const aktifProgram = formData.sektorelProgram;
    const programConfig = programConfigs[aktifProgram as keyof typeof programConfigs];

    // JSON rapor objesi oluştur
    const reportData = {
      metadata: {
        reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        reportType: 'Yatırım Teşvik Ön Değerlendirme Raporu',
        version: '1.0'
      },
      sirketBilgileri: {
        sirketAdi: formData.sirketAdi,
        kobiStatusu: formData.kobiStatusu,
        naceKodu: formData.naceKodu,
        naceAciklama: formData.naceSearch,
        faaliyetSuresi: formData.faaliyetSuresi ? parseInt(formData.faaliyetSuresi) : null,
        mevcutIstihdam: formData.mevcutIstihdam ? parseInt(formData.mevcutIstihdam) : null
      },
      yatirimProjesi: {
        yatirimTuru: formData.yatirimTuru,
        ilaveIstihdam: formData.ilaveIstihdam ? parseInt(formData.ilaveIstihdam) : null,
        tamamlanmaSuresiAy: formData.tamamlanmaSuresiAy ? parseInt(formData.tamamlanmaSuresiAy) : null
      },
      yatirimMaliyetleri: {
        ithalMakineTeçhizat: {
          formatted: formData.ithalMakine || '0 TL',
          numeric: ithalMakine
        },
        yerliMakineTeçhizat: {
          formatted: formData.yerliMakine || '0 TL',
          numeric: yerliMakine
        },
        binaInsaatGiderleri: {
          formatted: formData.binaInsaat || '0 TL',
          numeric: binaInsaat
        },
        digerYatirimGiderleri: {
          formatted: formData.digerGiderler || '0 TL',
          numeric: digerGiderler
        },
        toplamSabitYatirim: {
          formatted: toplam || '0 TL',
          numeric: toplamYatirim
        }
      },
      yatirimLokasyonu: {
        il: formData.yatirimIli || null,
        ilce: formData.yatirimIlcesi || null,
        yatirimBolgesi: formData.yatirimBolgesi,
        bolgeLabel: bolgeLabel,
        osb: formData.yatirimBolgesi ? (formData.yatirimBolgesi.includes('OSB') ? true : false) : false
      },
      uygunlukOzeti: {
        hedefYatirim: formData.hedefYatirim,
        oncelikliYatirim: formData.oncelikliYatirim,
        yuksekTeknoloji: formData.yuksekTeknoloji,
        ortaYuksekTeknoloji: formData.ortaYuksekTeknoloji
      },
      teşvikProgramlari: {
        sektorelProgram: {
          program: aktifProgram,
          programAdi: programConfig?.name || null,
          yatirimaKatkiOrani: programConfig?.yko || null,
          vergiIndirimOrani: programConfig?.vergiIndirimOrani || null,
          sgkSure: programConfig?.sgkSure || null,
          faizDestegi: programConfig?.faizDestegi || false,
          faizMax: programConfig?.faizMax || null,
          faizAzamiOran: programConfig?.faizAzamiOran || null,
          minYatirim: getAsgariTutarText()
        },
        ozelProgram: formData.ozelProgram || null,
        dijitalProgram: formData.dijitalProgram || null,
        oncelikliUrun: formData.oncelikliUrun || null,
        oncelikliYatirimKonusu: formData.oncelikliYatirimKonusu || null
      },
      destekUnsurlari: {
        bolge: bolgeLabel,
        unsurlar: destekList.map(item => ({
          ad: item.ad,
          deger: item.deger || null,
          aciklama: item.aciklama || null
        }))
      },
      hesaplamalar: {
        asgariYatirimTutari: getAsgariTutarText(),
        asgariYatirimKarsilama: toplamYatirim > 0 ? {
          karsilaniyor: true,
          tutar: toplamYatirim
        } : {
          karsilaniyor: false,
          tutar: 0
        }
      }
    };

    // JSON'u formatla ve indir
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yatirim-tesvik-raporu-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  */

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

  const handleSubmit = async (e: React.FormEvent) => {
    const naceKodu = searchParams.get('n') || searchParams.get('naceKodu');
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsLoading(true);
    setLoadingProgress(0);
    setDownloadUrl('');
    setApiDownloadUrl(null);
    setShowReport(false);

    // Yavaş yavaş dolsun: 0→100% tam 1,5 dakikada (90 sn). Süre dolmadan success göstermiyoruz.
    const PROGRESS_TICK_MS = 1500;
    const PROGRESS_STEPS = 60;
    const PROGRESS_INC = 100 / PROGRESS_STEPS;
    const id = setInterval(() => {
      setLoadingProgress((p) => {
        const next = p + PROGRESS_INC;
        if (next >= 100) {
          clearInterval(id);
          progressIntervalRef.current = null;
          return 100;
        }
        return next;
      });
    }, PROGRESS_TICK_MS);
    progressIntervalRef.current = id;

    try {
      const destekBolgesi = searchParams.get('db') || searchParams.get('destekBolgesi') || searchParams.get('faydalanacakBolge') || formData.yatirimBolgesi;
      const naceAciklama = searchParams.get('na') || searchParams.get('naceAciklama') || formData.naceAciklama;
      const response = await fetch('/api/lore/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formVerileri: {
            ...formData,
            destekBolgesi,
            naceKodu,
            naceAciklama,
            sabitYatirimTutari: calculateTotalInvestment(),
          },
        }),
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Linki sakla; ekranı hemen değiştirme. Progress 100% olunca useEffect açacak.
        setApiDownloadUrl(data.download_pdf_url ?? data.download_url ?? '');
      } else {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setIsLoading(false);
        alert(`Hata: ${data.error || data.message || 'Rapor oluşturulamadı'}`);
      }
    } catch {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsLoading(false);
      alert('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
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
        
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Rapor Hazırlanıyor...' : 'LORE AI® kullanarak Detaylı Analiz Raporu Oluştur'}
        </button>
        
      </form>

        {(isLoading || (showReport && downloadUrl)) && (
        <div className={styles.reportContainer} ref={reportRef}>
          {isLoading ? (
            <div className={styles.reportContent} style={{ textAlign: 'center', padding: '50px 24px' }}>
              <h2 style={{ color: '#0732ef', marginBottom: '12px', fontSize: '1.35rem' }}>
                {loadingProgress >= 100 ? 'Son aşama…' : 'Rapor Hazırlanıyor'}
              </h2>
              <p style={{ marginBottom: '24px', fontSize: '1rem', color: '#6b7280' }}>
                {loadingProgress >= 100
                  ? 'Rapor neredeyse hazır. İndirme linki birkaç saniye içinde görünecek.'
                  : 'Sadece size özel AI destekli raporunuz özenle hazırlanıyor. Lütfen bekleyiniz.'}
              </p>
              <div style={{ maxWidth: 400, margin: '0 auto 12px' }}>
                <div
                  style={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: 'rgba(7, 50, 239, 0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(loadingProgress, 100)}%`,
                      borderRadius: 6,
                      background: 'linear-gradient(90deg, #0732ef 0%, #001bb1 100%)',
                      transition: 'width 0.4s ease-out',
                    }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0732ef' }}>%{Math.round(Math.min(loadingProgress, 100))}</p>
            </div>
          ) : (
            <div className={styles.reportContent} style={{ textAlign: 'center', padding: '50px 20px' }}>
              <h2 style={{ color: '#2e7d32', marginBottom: '20px' }}>✅ Raporunuz Hazırlandı!</h2>
              <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
                Analiz sonuçlarınız başarıyla oluşturuldu. Aşağıdaki butona tıklayarak belgenizi indirebilirsiniz.
              </p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.submitButton}
                style={{
                  textDecoration: 'none',
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #0732ef 0%, #001bb1 100%)',
                  padding: '16px 40px',
                }}
              >
                📄 Raporu PDF Olarak İndir
              </a>
            </div>
          )}
        </div>
      )}

      {/* AI Yorumlama Modal */}
      <Modal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        aria-labelledby="ai-modal-title"
        aria-describedby="ai-modal-desc"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            bgcolor: mode === 'dark' ? 'rgba(30,30,30,0.97)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(8px)',
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
            minWidth: 340,
            maxWidth: 700,
            maxHeight: '80vh',
            overflowY: 'auto',
            transition: 'background-color 0.3s ease',
          }}
        >
          <Typography id="ai-modal-title" variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
            🤖 Yapay Zeka Yatırım Yorumlama
          </Typography>
          <Box id="ai-modal-desc" sx={{ mt: 2, color: mode === 'dark' ? '#e0e0e0' : '#333' }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, textAlign: 'center', fontWeight: 500 }}>
              Yapay zeka destekli analiz sistemimiz yakında hizmetinizde! Aşağıdaki detaylı analiz başlıkları sizi bekliyor:
            </Typography>
            
            <Box component="ul" sx={{ pl: 0, mb: 3, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)', borderLeft: '4px solid #667eea' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: mode === 'dark' ? '#ffffff' : '#333' }}>
                  1. Temel Uygunluk ve Bölge Tespiti Analizi
                </Typography>
                <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666', lineHeight: 1.6 }}>
                  Yatırımınızın temel uygunluk kriterlerini ve bölge tespitini detaylı olarak analiz eder.
                </Typography>
              </Box>
              
              <Box component="li" sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)', borderLeft: '4px solid #667eea' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: mode === 'dark' ? '#ffffff' : '#333' }}>
                  2. Mali Yeterlilik ve Asgari Yatırım Tutarı Kontrolü (2026 Güncel Tutarları)
                </Typography>
                <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666', lineHeight: 1.6 }}>
                  En güncel 2026 tutarları ile mali yeterliliğinizi ve asgari yatırım tutarı gereksinimlerini kontrol eder.
                </Typography>
              </Box>
              
              <Box component="li" sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)', borderLeft: '4px solid #667eea' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: mode === 'dark' ? '#ffffff' : '#333' }}>
                  3. Program Eşleşmesi ve Stratejik Uygunluk
                </Typography>
                <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666', lineHeight: 1.6 }}>
                  Yatırımınızın hangi teşvik programlarına uygun olduğunu ve stratejik uygunluğunu değerlendirir.
                </Typography>
              </Box>
              
              <Box component="li" sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)', borderLeft: '4px solid #667eea' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: mode === 'dark' ? '#ffffff' : '#333' }}>
                  4. Yerel Kalkınma ve Sektörel Fırsatlar
                </Typography>
                <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666', lineHeight: 1.6 }}>
                  Yatırım bölgenizdeki yerel kalkınma fırsatlarını ve sektörel avantajları analiz eder.
                </Typography>
              </Box>
              
              <Box component="li" sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)', borderLeft: '4px solid #667eea' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: mode === 'dark' ? '#ffffff' : '#333' }}>
                  5. Destek Unsurları ve Finansal Getiri Tahmini
                </Typography>
                <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666', lineHeight: 1.6 }}>
                  Destek unsurlarını detaylı olarak hesaplar ve finansal getiri tahminleri sunar.
                </Typography>
              </Box>
              
              <Box component="li" sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)', borderLeft: '4px solid #667eea' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: mode === 'dark' ? '#ffffff' : '#333' }}>
                  6. Belge Hazırlığı ve E-TUYS Uygunluğu
                </Typography>
                <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666', lineHeight: 1.6 }}>
                  Gerekli belgeleri listeler ve E-TUYS sistemine uygunluğunuzu kontrol eder.
                </Typography>
              </Box>
              
              <Box component="li" sx={{ mb: 2.5, p: 2, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)', borderLeft: '4px solid #667eea' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: mode === 'dark' ? '#ffffff' : '#333' }}>
                  7. Risk Analizi ve Kısıtlamalar
                </Typography>
                <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#666', lineHeight: 1.6 }}>
                  Potansiyel riskleri ve kısıtlamaları tespit ederek önlem önerileri sunar.
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            onClick={() => setAiModalOpen(false)}
            sx={{ mt: 3 }}
            variant="contained"
            color="primary"
            fullWidth
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Kapat
          </Button>
        </Box>
      </Modal>
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
