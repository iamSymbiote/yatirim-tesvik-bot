"use client";
import { useState, useRef, useEffect } from 'react';
import { Typography, Box, Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, Checkbox, Button, Modal, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import naceList from '../data/nace.json';
import iller from '../data/iller.json';
import hedefYatirimlar from '../data/hedefYatirimlar.json';
import yuksekTekno from '../data/yuksekTekno.json';
import ortaYuksekTekno from '../data/ortaYuksekTekno.json';
import destekVerileri from '../data/destekVerileri.json';
import destekUnsurlariBolgeBazli from '../data/destekUnsurlariBolgeBazli.json';
import oncelikliYatirimlar from '../data/oncelikliYatirimlar.json';
import oncelikliYatirimKonulariYENi from '../data/oncelikliYatirimKonulariYENi.json';
import Image from 'next/image';
import { getBolge, getDestekBolgesi, getAsgariYatirimTutari } from "../utils/yatirimbolgesihesap";
import { useTheme } from './ThemeProvider';
import jsPDF from 'jspdf';

export default function Home() {
  const { mode, toggleTheme } = useTheme();
  const [selectedIl, setSelectedIl] = useState('');
  const [selectedIlce, setSelectedIlce] = useState('');
  const [naceValue, setNaceValue] = useState<any>(null);
  const [naceInput, setNaceInput] = useState('');
  const [naceOpen, setNaceOpen] = useState(false); // NACE dropdown açık/kapalı durumu
  const [osb, setOsb] = useState('hayir');
  const [checked, setChecked] = useState(true); // Test için true olarak ayarlandı
  const [modalOpen, setModalOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  // İller object'ini array'e çevir
  const illerArray = Object.keys(iller);
  
  const ilceler = selectedIl ? iller[selectedIl as keyof typeof iller] || [] : [];
  // Gerçek ilçeleri ayır (Diğer Tüm İlçeler hariç)
  const gercekIlceler = ilceler.filter(ilce => ilce !== 'Diğer Tüm İlçeler');
  
  // İlçe seçenekleri: gerçek ilçeler varsa separator ile, yoksa sadece Diğer Tüm İlçeler
  const ilceOptions = selectedIl ? (() => {
    if (gercekIlceler.length > 0) {
      // Gerçek ilçeler + separator + Diğer Tüm İlçeler
      return [...gercekIlceler, '__SEPARATOR__', 'Diğer Tüm İlçeler'];
    } else {
      // Sadece Diğer Tüm İlçeler (separator olmadan)
      return ['Diğer Tüm İlçeler'];
    }
  })() : [];
  
  // NACE arama filtreleme - düzeltildi
  const filteredNace: any[] = naceInput.length >= 2
    ? (naceList as any[]).filter(option =>
        option.kod.toLowerCase().includes(naceInput.toLowerCase()) ||
        option.tanim.toLowerCase().includes(naceInput.toLowerCase())
      )
    : (naceList as any[]); // Boş input'ta tüm listeyi göster
  
  // Hedef yatırım kontrolü
  const isHedefYatirim = (naceKodu: string) => {
    return hedefYatirimlar.some(hedef => hedef.kod === naceKodu);
  };

  // Yüksek teknoloji kontrolü
  const isYuksekTeknoloji = (naceKodu: string) => {
    const result = yuksekTekno.includes(naceKodu);
    console.log(`Yüksek Teknoloji Kontrolü - NACE: ${naceKodu}, Sonuç: ${result}`);
    return result;
  };

  // Orta-yüksek teknoloji kontrolü
  const isOrtaYuksekTeknoloji = (naceKodu: string) => {
    const result = ortaYuksekTekno.includes(naceKodu);
    console.log(`Orta-Yüksek Teknoloji Kontrolü - NACE: ${naceKodu}, Sonuç: ${result}`);
    return result;
  };

  // Öncelikli yatırım kontrolü (NACE kodu eşleştirmesi + 6. bölge özel durumu)
  const isOncelikliYatirim = (nace: any) => {
    // 6. bölge illeri için otomatik öncelikli yatırım
    if (selectedIl) {
      const bolge = getBolge(selectedIl);
      if (bolge === 6) {
        return true; // 6. bölge illeri otomatik olarak öncelikli kapsamda
      }
    }
    
    // Diğer bölgeler için NACE kodu kontrolü
    if (!nace) return false;
    const naceKodu = nace.kod;
    
    // Yeni öncelikli yatırım konuları listesinde NACE kodu var mı?
    const yeniListedeVar = oncelikliYatirimKonulariYENi.some(item => item.kod === naceKodu);
    if (yeniListedeVar) {
      console.log(`Öncelikli Yatırım Kontrolü - NACE: ${naceKodu}, Yeni Listede: EVET`);
      return true;
    }
    
    // Eski sistem: NACE tanımı ile açıklama karşılaştırması
    const tanim = (nace.tanim || '').toLowerCase();
    const eskiListedeVar = oncelikliYatirimlar.some(item =>
      item.aciklama && tanim && item.aciklama.toLowerCase().includes(tanim)
    );
    
    console.log(`Öncelikli Yatırım Kontrolü - NACE: ${naceKodu}, Yeni Listede: ${yeniListedeVar ? 'EVET' : 'HAYIR'}, Eski Listede: ${eskiListedeVar ? 'EVET' : 'HAYIR'}`);
    return eskiListedeVar;
  };

  // PDF oluşturma fonksiyonu - Web sitesi tasarımına uygun
  const generatePDF = () => {
    if (!showResult || !naceValue || !selectedIl || !selectedIlce) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Türkçe karakter desteği için font ayarları
    doc.setFont('helvetica', 'normal');
    
    // Türkçe karakterleri düzgün göstermek için yardımcı fonksiyon
    const turkceMetin = (metin: string) => {
      return metin
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'I')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 'S')
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'U')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'O')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'C');
    };

    // Arka plan rengi - Web sitesi gibi koyu gri
    doc.setFillColor(45, 45, 45);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header - Web sitesi gibi mavi gradient
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    // Logo alanı (mavi kutu içinde)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(turkceMetin('YATIRIM TESVIK ROBOTU'), pageWidth / 2, 35, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(turkceMetin('Yatirim Tesvik Sorgulama Raporu'), pageWidth / 2, 55, { align: 'center' });
    
    yPosition = 100;

    // Tarih ve rapor bilgileri - Web sitesi gibi mavi kutu
    doc.setFillColor(25, 118, 210);
    doc.rect(20, yPosition - 5, pageWidth - 40, 35, 'F');
    
    const now = new Date();
    const tarih = now.toLocaleDateString('tr-TR');
    const saat = now.toLocaleTimeString('tr-TR');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(turkceMetin(`Rapor Tarihi: ${tarih} ${saat}`), 30, yPosition);
    doc.text(turkceMetin(`Rapor No: YTR-${Date.now().toString().slice(-6)}`), 30, yPosition + 12);
    yPosition += 45;

    // Seçilen bilgiler - Web sitesi gibi beyaz kart
    doc.setFillColor(255, 255, 255);
    doc.rect(20, yPosition - 5, pageWidth - 40, 100, 'F');
    
    // Başlık - Web sitesi gibi mavi
    doc.setFillColor(25, 118, 210);
    doc.rect(20, yPosition - 5, pageWidth - 40, 25, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(turkceMetin('SECILEN BILGILER'), 30, yPosition + 10);
    yPosition += 35;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const bilgiler = [
      { label: 'Il:', value: selectedIl },
      { label: 'Ilce:', value: selectedIlce },
      { label: 'NACE Kodu:', value: naceValue.kod },
      { label: 'OSB/Endustri Bolgesi:', value: osb === 'evet' ? 'Evet' : 'Hayir' }
    ];
    
    bilgiler.forEach((bilgi, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(turkceMetin(bilgi.label), 30, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(25, 118, 210);
      doc.text(turkceMetin(bilgi.value), 30 + 80, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 12;
    });
    
    // NACE tanımı ayrı satırda
    doc.setFont('helvetica', 'bold');
    doc.text(turkceMetin('NACE Tanimi:'), 30, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(25, 118, 210);
    const tanimSatirlari = doc.splitTextToSize(turkceMetin(naceValue.tanim), pageWidth - 80);
    doc.text(tanimSatirlari, 30, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += tanimSatirlari.length * 4 + 20;

    // Yatırımın özellikleri - Web sitesi gibi yeşil kart
    doc.setFillColor(255, 255, 255);
    doc.rect(20, yPosition - 5, pageWidth - 40, 80, 'F');
    
    // Başlık - Web sitesi gibi yeşil
    doc.setFillColor(76, 175, 80);
    doc.rect(20, yPosition - 5, pageWidth - 40, 25, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(turkceMetin('YATIRIMIN OZELLIKLERI'), 30, yPosition + 10);
    yPosition += 35;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const ozellikler = [
      { label: 'Hedef Yatirim:', value: isHedefYatirim(naceValue) ? 'EVET' : 'HAYIR' },
      { label: 'Yuksek Teknoloji Listesi:', value: isYuksekTeknoloji(naceValue) ? 'EVET' : 'HAYIR' },
      { label: 'Orta-Yuksek Teknoloji Listesi:', value: isOrtaYuksekTeknoloji(naceValue) ? 'EVET' : 'HAYIR' },
      { label: 'Oncelikli Yatirim Konusu:', value: isOncelikliYatirim(naceValue) ? 'EVET' : 'HAYIR' }
    ];
    
    ozellikler.forEach((ozellik) => {
      doc.setFont('helvetica', 'bold');
      doc.text(turkceMetin(ozellik.label), 30, yPosition);
      doc.setFont('helvetica', 'normal');
      const renk = ozellik.value === 'EVET' ? [76, 175, 80] : [244, 67, 54];
      doc.setTextColor(renk[0], renk[1], renk[2]);
      doc.text(turkceMetin(ozellik.value), 30 + 100, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;
    });
    yPosition += 15;

    // Destek bilgileri - Web sitesi gibi turuncu kart
    doc.setFillColor(255, 255, 255);
    doc.rect(20, yPosition - 5, pageWidth - 40, 70, 'F');
    
    // Başlık - Web sitesi gibi turuncu
    doc.setFillColor(255, 152, 0);
    doc.rect(20, yPosition - 5, pageWidth - 40, 25, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(turkceMetin('DESTEK BILGILERI'), 30, yPosition + 10);
    yPosition += 35;

    const destekBolgesi = getDestekBolgesi(selectedIl, selectedIlce, osb);
    const asgariTutar = getAsgariYatirimTutari(getBolge(selectedIl) || 0);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(turkceMetin('Faydalanacagi Destek Bolgesi:'), 30, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 152, 0);
    doc.text(turkceMetin(`${destekBolgesi || '-'}. Bolge`), 30 + 100, yPosition);
    yPosition += 12;
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(turkceMetin('Asgari Yatirim Tutari:'), 30, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 152, 0);
    doc.text(turkceMetin(asgariTutar), 30 + 100, yPosition);
    yPosition += 25;

    // Destek unsurları - Web sitesi gibi mor kart
    doc.setFillColor(255, 255, 255);
    doc.rect(20, yPosition - 5, pageWidth - 40, 60, 'F');
    
    // Başlık - Web sitesi gibi mor
    doc.setFillColor(156, 39, 176);
    doc.rect(20, yPosition - 5, pageWidth - 40, 25, 'F');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(turkceMetin('DESTEK UNSURLARI'), 30, yPosition + 10);
    yPosition += 35;

    const destekUnsurlari = getDestekUnsurlariByBolge(selectedIl, selectedIlce, osb);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    destekUnsurlari.slice(0, 3).forEach((destek, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(turkceMetin(destek.ad + ':'), 30, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 39, 176);
      doc.text(turkceMetin(destek.deger), 30 + 80, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
    });
    
    if (destekUnsurlari.length > 3) {
      doc.setFont('helvetica', 'italic');
      doc.text(turkceMetin(`... ve ${destekUnsurlari.length - 3} destek unsuru daha`), 30, yPosition);
    }

    // Alt bilgi - Footer - Web sitesi gibi koyu gri
    yPosition = pageHeight - 40;
    doc.setFillColor(45, 45, 45);
    doc.rect(0, yPosition - 10, pageWidth, 40, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(200, 200, 200);
    doc.text(turkceMetin('Bu rapor Yatirim Tesvik Robotu tarafindan otomatik olarak olusturulmustur.'), pageWidth / 2, yPosition, { align: 'center' });
    doc.text(turkceMetin('Detayli bilgi icin resmi kaynaklara basvurunuz.'), pageWidth / 2, yPosition + 8, { align: 'center' });

    // PDF'i indir
    doc.save(`yatirim-tesvik-raporu-${selectedIl}-${naceValue.kod}-${tarih.replace(/\./g, '-')}.pdf`);
  };

  // Bölge bazında destek unsurlarını getir
  const getDestekUnsurlariByBolge = (selectedIl: string, selectedIlce: string, osb: string) => {
    if (!selectedIl || !selectedIlce) return destekVerileri.destekUnsurlari;
    
    const destekBolgesi = getDestekBolgesi(selectedIl, selectedIlce, osb);
    if (!destekBolgesi) return destekVerileri.destekUnsurlari;
    
    const bolgeKey = `${destekBolgesi}. Bölge` as keyof typeof destekUnsurlariBolgeBazli;
    return destekUnsurlariBolgeBazli[bolgeKey] || destekVerileri.destekUnsurlari;
  };
  
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showResult]);

  // Debug: JSON dosyalarının yüklenip yüklenmediğini kontrol et
  useEffect(() => {
    console.log('NACE Listesi Yüklendi:', naceList.length, 'kod');
    console.log('Yüksek Teknoloji Listesi Yüklendi:', yuksekTekno.length, 'kod');
    console.log('Orta-Yüksek Teknoloji Listesi Yüklendi:', ortaYuksekTekno.length, 'kod');
    console.log('Örnek NACE Kodları:', naceList.slice(0, 3));
    console.log('Örnek Yüksek Teknoloji Kodları:', yuksekTekno.slice(0, 5));
    console.log('Örnek Orta-Yüksek Teknoloji Kodları:', ortaYuksekTekno.slice(0, 5));
  }, []);

  return (
    <div className="app-center">
      {/* Filigran ve Kopyalama Uyarısı */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '2rem',
        color: 'rgba(0,0,0,0.03)',
        fontWeight: 'bold',
        pointerEvents: 'none',
        zIndex: 1000,
        userSelect: 'none',
        whiteSpace: 'nowrap'
      }}>
        LORE DANIŞMANLIK
      </div>
      
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

      {/* Kopyalama Uyarısı - Sadece sorgula yapıldığında görünür */}
      {showResult && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: mode === 'dark' ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)',
          color: '#e53935',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 500,
          border: '1px solid rgba(229,57,53,0.3)',
          zIndex: 1001,
          userSelect: 'none'
        }}>
          ⚠️ Bu içerik kopyalanamaz ve LORE Danışmanlık'a aittir
        </div>
      )}
      
      <div className="tesvik-card">
        <Image src="/assets/lore-logo.png" alt="Lore Danışmanlık Logo" className="tesvik-logo" width={220} height={120} />
        <Typography className="tesvik-title" variant="h4" fontWeight={700} gutterBottom>
          Teşvik Robotu
        </Typography>
        <Typography className="tesvik-subtitle" variant="subtitle1">
          Yatırım Teşviklerini Hesaplama Uygulaması
        </Typography>
        <form className="tesvik-form" autoComplete="off">
          <div className="tesvik-row-horizontal">
            <div className="tesvik-box us97-vertical-flex">
              <div className="us97-autocomplete-row">
                <Autocomplete
                  options={filteredNace}
                  getOptionLabel={(option: any) => `${option.kod} - ${option.tanim}`}
                  value={naceValue}
                  onChange={(_: any, newValue: any) => setNaceValue(newValue)}
                  inputValue={naceInput}
                  onInputChange={(_: any, newInput: any) => setNaceInput(newInput)}
                  open={naceOpen} // NACE dropdown açık/kapalı durumu
                  onOpen={() => setNaceOpen(true)} // Autocomplete açıldığında açık olsun
                  onClose={() => setNaceOpen(false)} // Autocomplete kapandığında kapalı olsun
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      label="NACE Kodu veya Tanımı"
                      variant="outlined"
                      fullWidth
                      onFocus={() => setNaceOpen(true)} // Tıklandığında dropdown'ı aç
                      helperText={naceInput.length > 0 && naceInput.length < 2 ? 'En az 2 karakter giriniz.' : 'Tüm NACE kodları listeleniyor...'}
                    />
                  )}
                  isOptionEqualToValue={(option: any, value: any) => option.kod === value.kod}
                  ListboxProps={{
                    style: { maxHeight: 260, overflowY: 'auto' },
                  }}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    // Unique key için NACE kodu kullan (zaten unique)
                    return (
                      <li key={option.kod} {...otherProps}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: 600, color: '#1976d2' }}>{option.kod}</span>
                          <span style={{ fontSize: '0.9rem', color: '#666' }}>{option.tanim}</span>
                        </div>
          </li>
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <div className="tesvik-row-vertical">
            <div className="tesvik-box yatirim-blok">
              <Autocomplete
                options={illerArray}
                value={selectedIl}
                onChange={(_: any, newValue: string | null) => {
                  setSelectedIl(newValue || '');
                  setSelectedIlce('');
                }}
                inputValue={selectedIl}
                onInputChange={(_: any, newInputValue: string) => {
                  setSelectedIl(newInputValue);
                  setSelectedIlce('');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Yatırım Yeri Seçiniz *"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    helperText="İl adını yazabilir veya listeden seçebilirsiniz"
                    error={!!(selectedIl && !illerArray.some(il => il.toLowerCase() === selectedIl.toLowerCase()))}
                  />
                )}
                freeSolo
                clearOnBlur={false}
                selectOnFocus
                handleHomeEndKeys
                filterOptions={(options, { inputValue }) => {
                  const filtered = options.filter(option =>
                    option.toLowerCase().includes(inputValue.toLowerCase())
                  );
                  return filtered;
                }}
                ListboxProps={{
                  style: { maxHeight: 300, overflowY: 'auto' },
                }}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={key} {...otherProps}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 500 }}>{option}</span>
                        {(() => {
                          const ilData = iller[option as keyof typeof iller];
                          const ilceCount = ilData?.length || 0;
                          return ilceCount > 0 ? (
                            <span style={{ fontSize: '0.8rem', color: '#666', opacity: 0.7 }}>
                              ({ilceCount} ilçe)
                            </span>
                          ) : null;
                        })()}
                      </div>
          </li>
                  );
                }}
              />
              <FormControl fullWidth margin="normal" disabled={!selectedIl}>
                <InputLabel>İlçe Seçiniz</InputLabel>
                <Select
                  value={selectedIlce}
                  label="İlçe Seçiniz"
                  onChange={(e: any) => setSelectedIlce(e.target.value)}
                >
                  {selectedIl && ilceOptions.length > 0 ? (
                    ilceOptions.map((ilce) =>
                      ilce === '__SEPARATOR__' ? (
                        <MenuItem key="separator" disabled style={{ opacity: 0.5, fontSize: 12, pointerEvents: 'none' }}>────────────</MenuItem>
                      ) : (
                        <MenuItem key={ilce} value={ilce}>{ilce}</MenuItem>
                      )
                    )
                  ) : null}
                </Select>
              </FormControl>
            </div>
          </div>
          <div className="tesvik-radio-row">
            <Typography variant="body2" fontWeight={500}>
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>OSB veya Endüstri Bölgesinde mi?</span>
            </Typography>
            <RadioGroup row value={osb} onChange={(e: any) => setOsb(e.target.value)}>
              <FormControlLabel value="evet" control={<Radio color="primary" />} label="Evet" />
              <FormControlLabel value="hayir" control={<Radio color="error" />} label="Hayır" />
            </RadioGroup>
          </div>
          <Button className="tesvik-button" variant="contained" color="error" size="large" fullWidth
            onClick={(e: any) => {
              e.preventDefault();
              if (
                selectedIl && selectedIlce && naceValue && checked
              ) {
                setShowResult(true);
              } else {
                setShowResult(false);
              }
            }}
            disabled={!checked}
          >
            SORGULA
          </Button>
          {/* Test modunda checkbox gizli - sürekli tıklamaya gerek yok */}
          {/* <div className="tesvik-checkbox-row">
            <Checkbox 
              checked={checked} 
              onChange={(e: any) => {
                setChecked(e.target.checked);
                if (e.target.checked) setTermsOpen(true);
              }}
              color="error" 
            />
            <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#444', transition: 'color 0.3s ease' }}>
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setTermsOpen(true)}>
                Kullanım Koşullarını okudum, anladım.
              </span>
            </Typography>
          </div> */}
          
          {/* Test modunda bilgi mesajı */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: mode === 'dark' ? 'rgba(0,255,0,0.1)' : 'rgba(0,255,0,0.05)',
            border: `1px solid ${mode === 'dark' ? 'rgba(0,255,0,0.3)' : 'rgba(0,255,0,0.2)'}`,
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.9rem',
            color: mode === 'dark' ? '#4caf50' : '#2e7d32'
          }}>
            🧪 <strong>Test Modu:</strong> Kullanım koşulları otomatik onaylandı. SORGULA butonu aktif.
          </div>
          {/* <div className="tesvik-footer">
            <InfoOutlinedIcon color="action" fontSize="small" style={{ marginTop: 2 }} />
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#a0a0a0' : '#666', transition: 'color 0.3s ease' }}>
              Yatırımlarda Devlet Yardımları Hakkında <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>Karar</a> ve <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>Tebliğine</a> göre hazırlanmıştır. <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>Kapsam Dışı Konular</a>
            </Typography>
          </div> */}
        </form>
        {showResult && (
          <div ref={resultRef} className="tesvik-sonuc-panel" style={{ marginTop: 32 }}>
            {/* PDF İndirme Butonu */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={generatePDF}
                startIcon={<span style={{ fontSize: '20px' }}>📊</span>}
                sx={{
                  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                  boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255, 107, 107, 0.6)',
                  },
                  px: 4,
                  py: 2,
                  fontSize: '18px',
                  fontWeight: 700,
                  borderRadius: '30px',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  color: 'white'
                }}
              >
                📄 Profesyonel PDF Raporu İndir
              </Button>
            </div>
            
            {/* Seçilen NACE kodu ve tanımı - Modern Info Panel */}
            {naceValue && (
              <div className="nace-info-panel">
                <div className="nace-info-badge">
                  NACE KODU
                </div>
                <div className="nace-code-display">
                  {naceValue.kod}
                </div>
                <div className="nace-description">
                  {naceValue.tanim}
                </div>
              </div>
            )}
            {/* Yatırım Yeri Tablosu */}
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              marginBottom: 32, 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease'
            }}>
              <tbody>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    minWidth: 180,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>Yatırım Yeri:</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>{selectedIl || '-'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>İlin Olduğu İlçe</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>{selectedIlce || '-'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>OSB veya Endüstri Bölgesinde mi?</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>{osb === 'evet' ? 'Evet' : 'Hayır'}</td>
                </tr>
              </tbody>
            </table>
            <hr style={{ 
              margin: '40px 0', 
              border: 0, 
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${mode === 'dark' ? '#404040' : '#e9ecef'} 50%, transparent 100%)`,
              transition: 'background 0.3s ease'
            }} />
            {/* Yatırımın Özellikleri Tablosu */}
            <div className="section-title" style={{ 
              color: mode === 'dark' ? '#e9ecef' : '#495057',
              transition: 'color 0.3s ease'
            }}>YATIRIMIN ÖZELLİKLERİ</div>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              marginBottom: 32, 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease'
            }}>
              <tbody>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>Yüksek Teknoloji Listesi</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>{naceValue && isYuksekTeknoloji(naceValue.kod) ? 'Evet' : 'Hayır'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>Orta-Yüksek Teknoloji Listesi</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>{naceValue && isOrtaYuksekTeknoloji(naceValue.kod) ? 'Evet' : 'Hayır'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>Öncelikli Yatırım Konusu</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>{naceValue && isOncelikliYatirim(naceValue) ? 'Evet' : 'Hayır'}</td>
                </tr>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>Hedef Yatırım</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>{naceValue && isHedefYatirim(naceValue.kod) ? 'Evet' : 'Hayır'}</td>
                </tr>
              </tbody>
            </table>
            
            {/* 6. Bölge Özel Öncelikli Yatırım Bilgi Paneli */}
            {selectedIl && getBolge(selectedIl) === 6 && (
              <div style={{
                background: mode === 'dark' ? 'rgba(255,193,7,0.15)' : 'rgba(255,193,7,0.1)',
                border: `2px solid ${mode === 'dark' ? 'rgba(255,193,7,0.4)' : 'rgba(255,193,7,0.3)'}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '32px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#ff9800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    ⭐
                  </div>
                  <Typography variant="h6" style={{
                    color: mode === 'dark' ? '#ffb74d' : '#e65100',
                    fontWeight: 700,
                    margin: 0
                  }}>
                    6. Bölge Öncelikli Yatırım Kapsamı
                  </Typography>
                </div>
                <Typography variant="body1" style={{
                  color: mode === 'dark' ? '#fff3e0' : '#333',
                  lineHeight: 1.6,
                  margin: 0,
                  marginBottom: '12px',
                  fontWeight: 500
                }}>
                  🎯 <strong>{selectedIl}</strong> ili 6. bölgede yer aldığı için, yatırımınız otomatik olarak <strong>"Öncelikli Yatırım Konusu"</strong> kapsamında değerlendirilecektir.
                </Typography>
                <Typography variant="body2" style={{
                  color: mode === 'dark' ? '#ffcc02' : '#f57c00',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  marginBottom: '8px'
                }}>
                  ✨ <strong>6. Bölge Avantajları:</strong>
                </Typography>
                <ul style={{
                  margin: '8px 0',
                  paddingLeft: '20px',
                  color: mode === 'dark' ? '#fff3e0' : '#333'
                }}>
                  <li>En yüksek yatırıma katkı oranı (%30)</li>
                  <li>En uzun sigorta primi desteği (12 YIL)</li>
                  <li>Öncelikli yatırım kapsamında ilave avantajlar</li>
                  <li>En düşük asgari yatırım tutarı (6.000.000 TL)</li>
                </ul>
                <Typography variant="body2" style={{
                  color: mode === 'dark' ? '#ffcc02' : '#f57c00',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  marginTop: '8px'
                }}>
                  💡 Bu avantajlardan faydalanmak için teşvik belgesi başvurunuzu yukarıdaki linkten yapabilirsiniz.
                </Typography>
              </div>
            )}
            
            <hr style={{ 
              margin: '40px 0', 
              border: 0, 
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${mode === 'dark' ? '#404040' : '#e9ecef'} 50%, transparent 100%)`,
              transition: 'background 0.3s ease'
            }} />
            {/* Yatırım Bölgesi ve Asgari Yatırım Tutarı Tablosu */}
            <div className="section-title" style={{ 
              color: mode === 'dark' ? '#e9ecef' : '#495057',
              transition: 'color 0.3s ease'
            }}>YATIRIM BÖLGESİ ve ASGARİ YATIRIM TUTARI</div>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              marginBottom: 32, 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease'
            }}>
              <tbody>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    fontWeight: 600,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>Bölgesi</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>
                    {selectedIl ? `${getBolge(selectedIl) ?? '-'}${getBolge(selectedIl) ? '.Bölge' : ''}` : '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    fontWeight: 600,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>Faydalanacağı Destek Bölgesi</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>
                    {selectedIl && selectedIlce ? (() => {
                      const destekBolgesi = getDestekBolgesi(selectedIl, selectedIlce, osb);
                      return `${destekBolgesi ?? '-'}${destekBolgesi ? '.Bölge' : ''}`;
                    })() : '-'}
                  </td>
                </tr>
                <tr>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    fontWeight: 600,
                    color: mode === 'dark' ? '#ffffff' : 'inherit',
                    transition: 'border-color 0.3s ease, color 0.3s ease'
                  }}>Asgari Yatırım Tutarı (TL)</td>
                  <td style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 10, 
                    color: '#e53935', 
                    fontWeight: 600,
                    transition: 'border-color 0.3s ease'
                  }}>
                    {selectedIl ? getAsgariYatirimTutari(getBolge(selectedIl) ?? 0) : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Teşvik Belgesi Başvuru Bilgi Paneli */}
            <div style={{
              background: mode === 'dark' ? 'rgba(25,118,210,0.1)' : 'rgba(25,118,210,0.05)',
              border: `1px solid ${mode === 'dark' ? 'rgba(25,118,210,0.3)' : 'rgba(25,118,210,0.2)'}`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#1976d2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  ℹ️
                </div>
                <Typography variant="h6" style={{
                  color: mode === 'dark' ? '#1976d2' : '#1565c0',
                  fontWeight: 600,
                  margin: 0
                }}>
                  Yeni Teşvik Belgesi Başvurusu
                </Typography>
              </div>
              <Typography variant="body1" style={{
                color: mode === 'dark' ? '#e0e0e0' : '#333',
                lineHeight: 1.6,
                margin: 0
              }}>
                <a 
                  href="https://www.yatirimtesvikbelgesi.com/tesvik-belgesi-basvuru-formu" 
            target="_blank"
            rel="noopener noreferrer"
                  style={{
                    color: '#1976d2',
                    textDecoration: 'underline',
                    fontWeight: 500
                  }}
                >
                  https://www.yatirimtesvikbelgesi.com/tesvik-belgesi-basvuru-formu
                </a>
                {' '}adresinden yeni teşvik belgesi alabilirsiniz.
              </Typography>
              <Typography variant="body2" style={{
                color: mode === 'dark' ? '#b0b0b0' : '#666',
                fontSize: '0.9rem',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                💡 Bu link sizi LORE Danışmanlık'ın resmi teşvik belgesi başvuru formuna yönlendirecektir.
              </Typography>
            </div>
            
            {/* Buradan sonra yeni ekran veya kutular eklenebilir */}
            <hr style={{ 
              margin: '40px 0', 
              border: 0, 
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${mode === 'dark' ? '#404040' : '#e9ecef'} 50%, transparent 100%)`,
              transition: 'background 0.3s ease'
            }} />
            {/* DESTEK UNSURLARI VE TÜRLERİ Birleşik Tablosu */}
            <div className="section-title" style={{ 
              color: mode === 'dark' ? '#e9ecef' : '#495057',
              transition: 'color 0.3s ease'
            }}>DESTEK UNSURLARI VE TÜRLERİ</div>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              marginBottom: 32, 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease'
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 12,
                    backgroundColor: mode === 'dark' ? '#404040' : '#f8f9fa',
                    color: mode === 'dark' ? '#ffffff' : '#495057',
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                  }}>Destek Unsuru</th>
                  <th style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 12,
                    backgroundColor: mode === 'dark' ? '#404040' : '#f8f9fa',
                    color: mode === 'dark' ? '#ffffff' : '#495057',
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                  }}>Açıklama</th>
                  <th style={{ 
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                    padding: 12,
                    backgroundColor: mode === 'dark' ? '#404040' : '#f8f9fa',
                    color: mode === 'dark' ? '#ffffff' : '#495057',
                    fontWeight: 600,
                    textAlign: 'center',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                  }}>Değer</th>
                </tr>
              </thead>
              <tbody>
                {/* Bölge bazlı destek unsurları */}
                {getDestekUnsurlariByBolge(selectedIl, selectedIlce, osb).map((destek, index) => (
                  <tr key={`unsur-${destek.ad}-${index}`}>
                    <td style={{ 
                      border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                      padding: 10,
                      color: mode === 'dark' ? '#ffffff' : 'inherit',
                      transition: 'border-color 0.3s ease, color 0.3s ease',
                      verticalAlign: 'top',
                      width: '30%'
                    }}>{destek.ad}</td>
                    <td style={{ 
                      border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                      padding: 10,
                      color: mode === 'dark' ? '#ffffff' : 'inherit',
                      transition: 'border-color 0.3s ease, color 0.3s ease',
                      verticalAlign: 'top',
                      width: '55%'
                    }}>{destek.aciklama}</td>
                    <td style={{ 
                      border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                      padding: 10, 
                      color: '#e53935', 
                      fontWeight: 600,
                      transition: 'border-color 0.3s ease',
                      textAlign: 'center',
                      width: '15%',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>{
                      destek.ad === 'Sigorta Primi İşveren Hissesi Desteği' && /^\d+$/.test(destek.deger)
                        ? `${destek.deger} YIL`
                        : destek.deger
                    }</td>
                  </tr>
                ))}
                {/* Sabit destek türleri */}
                {destekVerileri.destekTurleri.map((destek, index) => (
                  <tr key={`tur-${destek.ad}-${index}`}>
                    <td style={{ 
                      border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                      padding: 10,
                      color: mode === 'dark' ? '#ffffff' : 'inherit',
                      transition: 'border-color 0.3s ease, color 0.3s ease',
                      verticalAlign: 'top',
                      width: '30%'
                    }}>{destek.ad}</td>
                    <td style={{ 
                      border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                      padding: 10,
                      color: mode === 'dark' ? '#ffffff' : 'inherit',
                      transition: 'border-color 0.3s ease, color 0.3s ease',
                      verticalAlign: 'top',
                      width: '55%'
                    }}>{destek.aciklama}</td>
                    <td style={{ 
                      border: `1px solid ${mode === 'dark' ? '#404040' : '#ccc'}`, 
                      padding: 10, 
                      color: '#e53935', 
                      fontWeight: 600,
                      transition: 'border-color 0.3s ease',
                      textAlign: 'center',
                      width: '15%'
                    }}>{destek.deger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Bölge Hesaplama Test Paneli */}
            {showResult && (
              <div style={{
                background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${mode === 'dark' ? '#404040' : '#e9ecef'}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '32px',
                transition: 'all 0.3s ease'
              }}>
                <div className="section-title" style={{ 
                  color: mode === 'dark' ? '#e9ecef' : '#495057',
                  transition: 'color 0.3s ease',
                  marginBottom: '16px'
                }}>🔍 Bölge Hesaplama Test Paneli</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px',
                  fontSize: '0.9rem'
                }}>
                  <div style={{
                    background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#e9ecef'}`
                  }}>
                    <strong>Seçilen İl:</strong> {selectedIl}<br/>
                    <strong>Ana Bölge:</strong> {getBolge(selectedIl) || '-'}. Bölge
                  </div>
                  <div style={{
                    background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#e9ecef'}`
                  }}>
                    <strong>Seçilen İlçe:</strong> {selectedIlce}<br/>
                    <strong>OSB Durumu:</strong> {osb === 'evet' ? 'Evet' : 'Hayır'}
                  </div>
                  <div style={{
                    background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${mode === 'dark' ? '#404040' : '#e9ecef'}`
                  }}>
                    <strong>Destek Bölgesi:</strong> {getDestekBolgesi(selectedIl, selectedIlce, osb) || '-'}. Bölge<br/>
                    <strong>Asgari Tutar:</strong> {getAsgariYatirimTutari(getBolge(selectedIl) || 0)}
                  </div>
                </div>
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: mode === 'dark' ? 'rgba(0,255,0,0.1)' : 'rgba(0,255,0,0.05)',
                  border: `1px solid ${mode === 'dark' ? 'rgba(0,255,0,0.3)' : 'rgba(0,255,0,0.2)'}`,
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: mode === 'dark' ? '#4caf50' : '#2e7d32'
                }}>
                  ✅ <strong>Algoritma Test Sonucu:</strong> Bölge hesaplama algoritması çalışıyor. 
                  {selectedIl && selectedIlce && osb && (
                    <> {selectedIl} ili {getBolge(selectedIl)}. bölgede, {selectedIlce === 'Diğer Tüm İlçeler' ? 'genel ilçe' : 'spesifik ilçe'} seçimi ve OSB {osb === 'evet' ? 'var' : 'yok'} durumuna göre {getDestekBolgesi(selectedIl, selectedIlce, osb)}. destek bölgesinden faydalanacak.</>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="tesvik-modal-title"
        aria-describedby="tesvik-modal-desc"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            bgcolor: mode === 'dark' ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
            minWidth: 320,
            transition: 'background-color 0.3s ease',
          }}
        >
          <Typography id="tesvik-modal-title" variant="h6" component="h2" gutterBottom>
            Bilgilendirme
          </Typography>
          <Typography id="tesvik-modal-desc" sx={{ mt: 2 }}>
            Lütfen tüm alanları eksiksiz doldurunuz.
          </Typography>
          <Button onClick={() => setModalOpen(false)} sx={{ mt: 2 }} variant="contained" color="error">
            Kapat
          </Button>
        </Box>
      </Modal>
      <Modal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        aria-labelledby="terms-modal-title"
        aria-describedby="terms-modal-desc"
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
            maxWidth: 540,
            maxHeight: '80vh',
            overflowY: 'auto',
            transition: 'background-color 0.3s ease',
          }}
        >
          <Typography id="terms-modal-title" variant="h6" component="h2" gutterBottom>
            LORE Danışmanlık Teşvik Robotu Kullanım Koşulları
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mb: 2, fontSize: '0.95rem' }}>
            Son Güncelleme Tarihi: 21 Temmuz 2025
          </Typography>
          <div id="terms-modal-desc" style={{ fontSize: '1.01rem', color: mode === 'dark' ? '#e0e0e0' : '#222' }}>
            <ol style={{ paddingLeft: 18 }}>
              <li>
                <b>Taraflar ve Tanımlar</b>
                <ul style={{ marginTop: 6, marginBottom: 6 }}>
                  <li>Bu Kullanım Koşulları (“Koşullar”), LORE Danışmanlık (“Hizmet Sağlayıcı” veya “Biz”) ile Hizmet Sağlayıcı’nın <a href="https://www.yatirimtesvikbelgesi.com/" target="_blank" rel="noopener noreferrer">https://www.yatirimtesvikbelgesi.com/</a> adresinde bulunan web sitesini ("Platform") ve özellikle "Teşvik Robotu" uygulamasını kullanan kişi veya kurumlar (“Kullanıcı” veya “Siz”) arasında akdedilmiştir.</li>
                  <li><b>Platform:</b> https://www.yatirimtesvikbelgesi.com/ web sitesi ve bünyesindeki "Teşvik Robotu" uygulaması.</li>
                  <li><b>Hizmetler:</b> Platform üzerinden sunulan tüm hizmetler, araçlar ve özellikler, özellikle Teşvik Robotu ve yatırım teşvik hesaplama uygulaması dahil.</li>
                  <li><b>Kullanıcı:</b> Platforma erişen, kullanan veya Platform üzerinden herhangi bir işlem gerçekleştiren gerçek veya tüzel kişi.</li>
                </ul>
              </li>
              <li>
                <b>Koşulların Kabulü</b>
                <p>Platform'u kullanarak, Hizmetler’den faydalanarak veya herhangi bir şekilde erişim sağlayarak, bu Koşulları okuduğunuzu, anladığınızı ve bunlara bağlı kalmayı kabul ettiğinizi beyan ve taahhüt edersiniz. Bu Koşulları kabul etmiyorsanız, Platform'u kullanmamalısınız.</p>
              </li>
              <li>
                <b>Hizmetlerin Kapsamı ve Amacı</b>
                <p>Hizmet Sağlayıcı, Platform üzerinden özellikle Teşvik Robotu aracılığıyla yatırım teşvik hesaplama ve ilgili konularda danışmanlık hizmetlerine yönelik bilgilendirme ve araçlar sunmaktadır. Platform'da sunulan bilgiler ve hesaplamalar genel bilgilendirme amacı taşımaktadır ve hukuki, finansal veya yatırım danışmanlığı yerine geçmez. Kullanıcılar, Platform'da yer alan bilgilere dayanarak alacakları kararların tüm sorumluluğunu üstlenirler.</p>
              </li>
              <li>
                <b>Kullanıcı Yükümlülükleri</b>
                <ul style={{ marginTop: 6, marginBottom: 6 }}>
                  <li>Kullanıcı, Platform'u yalnızca yasalara ve bu Koşullara uygun olarak kullanmayı kabul eder.</li>
                  <li>Kullanıcı, Platform üzerinden girilen bilgilerin (NACE Kodu, yatırım yeri, ilçe, OSB durumu vb.) doğru, eksiksiz ve güncel olmasından tek başına sorumludur. Yanlış veya eksik bilgi girişinden kaynaklanan sorunlardan Hizmet Sağlayıcı sorumlu değildir.</li>
                  <li>Kullanıcı, Platform'u kullanarak herhangi bir yasa dışı, zararlı, tehditkar, küfürlü, taciz edici, hakaret edici, küçük düşürücü, müstehcen, nefret dolu veya ırksal, etnik veya başka bir şekilde sakıncalı içerik oluşturmayacak, yüklemeyecek veya yaymayacaktır.</li>
                  <li>Kullanıcı, Platform'un işleyişine müdahale etmeyecek, Platform'a virüs, truva atı gibi zararlı yazılımlar bulaştırmaya çalışmayacak veya Platform'un güvenliğini ihlal etmeyecektir.</li>
                  <li>Platformda sunulan her türlü yazılım, tasarım, metin, görsel, grafik, video, ses dosyası ve diğer tüm içerikler Hizmet Sağlayıcı'ya veya lisans verenlerine aittir ve telif hakları ile korunmaktadır. Kullanıcı, bu içerikleri kopyalamayacak, dağıtmayacak, çoğaltmayacak veya türev eserler oluşturmayacaktır.</li>
                </ul>
              </li>
              <li>
                <b>Fikri Mülkiyet Hakları</b>
                <p>Platform'un tüm fikri mülkiyet hakları (telif hakları, ticari markalar, veri tabanı hakları ve diğer tüm haklar dahil) Hizmet Sağlayıcı'ya aittir veya Hizmet Sağlayıcı'nın yasal kullanım hakkına sahip olduğu lisanslı materyallerden oluşmaktadır. Bu Koşullar size Platform'da bulunan herhangi bir fikri mülkiyet üzerinde herhangi bir hak veya lisans vermemektedir.</p>
              </li>
              <li>
                <b>Sorumluluk Reddi ve Sorumluluğun Sınırlandırılması</b>
                <ul style={{ marginTop: 6, marginBottom: 6 }}>
                  <li>Platform'da sunulan tüm hizmetler ve bilgiler "olduğu gibi" ve "mevcut olduğu şekilde" sunulmaktadır. Hizmet Sağlayıcı, Platform'un kesintisiz, hatasız, güvenli veya belirli bir amaca uygun olacağına dair herhangi bir garanti vermez.</li>
                  <li>Teşvik Robotu aracılığıyla sağlanan hesaplamalar ve sonuçlar, genel bilgilendirme ve ön fizibilite amaçlıdır. Bu hesaplamalar, ilgili mevzuatın yorumlanmasına, girilen verilere ve algoritmalara dayanır. Gerçek teşvik tutarları ve koşulları, ilgili resmi kurumların (T.C. Sanayi ve Teknoloji Bakanlığı, KOSGEB vb.) güncel mevzuatına, başvuru sahiplerinin özel durumlarına ve değerlendirmelerine göre farklılık gösterebilir.</li>
                  <li>Hizmet Sağlayıcı, Platform'un kullanımından veya kullanılamamasından kaynaklanan (doğrudan veya dolaylı) herhangi bir kar kaybı, veri kaybı, itibar kaybı veya diğer maddi/manevi zararlardan sorumlu tutulamaz.</li>
                  <li>Hizmet Sağlayıcı, Platform'da yer alan bağlantılar aracılığıyla erişilen üçüncü taraf web sitelerinin içeriklerinden veya politikalarından sorumlu değildir.</li>
                </ul>
              </li>
              <li>
                <b>Değişiklikler</b>
                <p>Hizmet Sağlayıcı, bu Koşulları dilediği zaman tek taraflı olarak değiştirme hakkını saklı tutar. Değişiklikler, Platform'da yayınlandığı tarihte yürürlüğe girer. Koşullardaki değişikliklerden sonra Platform'u kullanmaya devam etmeniz, değiştirilmiş Koşulları kabul ettiğiniz anlamına gelir.</p>
              </li>
              <li>
                <b>Gizlilik Politikası</b>
                <p>Kullanıcıların kişisel verilerinin toplanması, kullanılması ve korunmasına ilişkin detaylar, Hizmet Sağlayıcı'nın ayrı bir belge olan Gizlilik Politikası'nda belirtilmiştir. Platform'u kullanarak, Gizlilik Politikası'nı da okuduğunuzu ve kabul ettiğinizi beyan edersiniz.</p>
              </li>
              <li>
                <b>Uygulanacak Hukuk ve Yetkili Mahkeme</b>
                <p>Bu Koşullardan kaynaklanan veya bunlarla ilgili her türlü uyuşmazlık Türk Hukukuna tabi olacak ve İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkili olacaktır.</p>
              </li>
              <li>
                <b>İletişim</b>
                <ul style={{ marginTop: 6, marginBottom: 6 }}>
                  <li>Adres: Beştepe Mah, Meriç Sokak, Milaslı 2000 İş Merkezi, NO:5 B, Daire: 7-8 PK 06560 Yenimahalle – Ankara</li>
                  <li>Telefon: +90 312 215 4 222 (PBX) | +90 312 215 4 220</li>
                  <li>Email: <a href="mailto:lore@lore.com.tr">lore@lore.com.tr</a></li>
                  <li>Faks: +90 312 215 42 29</li>
                </ul>
              </li>
            </ol>
          </div>
          <Button onClick={() => setTermsOpen(false)} sx={{ mt: 2 }} variant="contained" color="error">
            Kapat
          </Button>
        </Box>
      </Modal>
    </div>
  );
}