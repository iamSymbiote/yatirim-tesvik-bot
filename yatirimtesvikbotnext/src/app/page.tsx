"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
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
import Image from 'next/image';
import { getBolge, getDestekBolgesi, getAsgariYatirimTutari } from "../utils/yatirimbolgesihesap";
import { useTheme } from './ThemeProvider';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();
  const [selectedIl, setSelectedIl] = useState('');
  const [selectedIlce, setSelectedIlce] = useState('');
  const [naceValue, setNaceValue] = useState<any>(null);
  const [naceInput, setNaceInput] = useState('');
  const [osb, setOsb] = useState('hayir');
  const [checked, setChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const ilceler = selectedIl ? (iller[selectedIl as keyof typeof iller] || []) : [];
  // Gerçek ilçeleri ayır (Diğer Tüm İlçeler hariç)
  const gercekIlceler = ilceler.filter(ilce => ilce !== 'Diğer Tüm İlçeler');
  // İlçe seçenekleri: gerçek ilçeler + separator + Diğer Tüm İlçeler
  const ilceOptions = selectedIl ? (gercekIlceler.length > 0 ? [...gercekIlceler, '__SEPARATOR__', 'Diğer Tüm İlçeler'] : ['Diğer Tüm İlçeler']) : [];
  const initialNaceOptions = useMemo(() => {
    const list = [...(naceList as any[])];
    // Karışık bir başlangıç listesi için basit shuffle
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, 20);
  }, []);

  const filteredNace: any[] = naceInput.length >= 2
    ? (naceList as any[]).filter(option =>
          option.kod.toLowerCase().includes(naceInput.toLowerCase()) ||
          option.tanim.toLowerCase().includes(naceInput.toLowerCase())
        )
    : initialNaceOptions;
  
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

  // Öncelikli yatırım kontrolü (NACE tanımı ile açıklama karşılaştırması)
  const isOncelikliYatirim = (nace: any) => {
    if (!nace) return false;
    const tanim = (nace.tanim || '').toLowerCase();
    // Basit bir eşleşme: açıklama içinde NACE tanımının bir kısmı geçiyorsa
    return oncelikliYatirimlar.some(item =>
      item.aciklama && tanim && item.aciklama.toLowerCase().includes(tanim)
    );
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

  useEffect(() => {
    if (termsOpen) {
      setHasScrolledTerms(false);
    }
  }, [termsOpen]);

  const handleTermsScroll = (e: any) => {
    const target = e.target;
    if (!target) return;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
      setHasScrolledTerms(true);
    }
  };

    // Debug: JSON dosyalarının yüklenip yüklenmediğini kontrol et
  useEffect(() => {
    console.log('Yüksek Teknoloji Listesi Yüklendi:', yuksekTekno.length, 'kod');
    console.log('Orta-Yüksek Teknoloji Listesi Yüklendi:', ortaYuksekTekno.length, 'kod');
    console.log('Örnek Yüksek Teknoloji Kodları:', yuksekTekno.slice(0, 5));
    console.log('Örnek Orta-Yüksek Teknoloji Kodları:', ortaYuksekTekno.slice(0, 5));
  }, []);

  return (
    <div className="app-center">
      {/* Dark Mode Toggle Button */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
          '@media (prefers-color-scheme: dark)': {
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
            },
          },
          '@media (max-width: 768px)': {
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            '& svg': {
              fontSize: '1.2rem',
            },
          },
        }}
      >
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      
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
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      label="NACE Kodu veya Tanımı"
                      variant="outlined"
                      fullWidth
                      helperText={naceInput.length > 0 && naceInput.length < 2 ? 'En az 2 karakter giriniz.' : ''}
                    />
                  )}
                  isOptionEqualToValue={(option: any, value: any) => option.kod === value.kod}
                  ListboxProps={{
                    style: { maxHeight: 260, overflowY: 'auto' },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="tesvik-row-vertical">
            <div className="tesvik-box yatirim-blok">
              <Autocomplete
                options={Object.keys(iller)}
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
                    error={!!(selectedIl && (() => {
                      const normalizeText = (text: string) => {
                        return text
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/ı/g, 'i')
                          .replace(/ğ/g, 'g')
                          .replace(/ü/g, 'u')
                          .replace(/ş/g, 's')
                          .replace(/ö/g, 'o')
                          .replace(/ç/g, 'c');
                      };
                      const normalizedInput = normalizeText(selectedIl);
                      return !Object.keys(iller).some(il => normalizeText(il) === normalizedInput);
                    })())}
                  />
                )}
                freeSolo
                clearOnBlur={false}
                selectOnFocus
                handleHomeEndKeys
                filterOptions={(options, { inputValue }) => {
                  // Türkçe karakter normalizasyonu
                  const normalizeText = (text: string) => {
                    return text
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '') // Diacritics kaldır
                      .replace(/ı/g, 'i')
                      .replace(/ğ/g, 'g')
                      .replace(/ü/g, 'u')
                      .replace(/ş/g, 's')
                      .replace(/ö/g, 'o')
                      .replace(/ç/g, 'c');
                  };
                  
                  const normalizedInput = normalizeText(inputValue);
                  const filtered = options.filter(option =>
                    normalizeText(option).includes(normalizedInput)
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
                          // "Diğer Tüm İlçeler"i sayıdan çıkar
                          const gercekIlceSayisi = ilData?.filter(ilce => ilce !== 'Diğer Tüm İlçeler').length || 0;
                          return gercekIlceSayisi > 0 ? (
                            <span style={{ fontSize: '0.8rem', color: '#666', opacity: 0.7 }}>
                              ({gercekIlceSayisi} ilçe)
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
              if (!checked) {
                setTermsOpen(true);
                return;
              }
              if (
                selectedIl && selectedIlce && naceValue
              ) {
                setShowResult(true);
              } else {
                setShowResult(false);
              }
            }}
          >
            SORGULA
          </Button>
          <div className="tesvik-checkbox-row">
            <Checkbox 
              checked={checked} 
              onChange={() => {
                setTermsOpen(true);
              }}
              color="error" 
            />
            <Typography variant="body2" sx={{ color: mode === 'dark' ? '#b0b0b0' : '#444', transition: 'color 0.3s ease' }}>
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setTermsOpen(true)}>
                Kullanım Koşullarını okudum, anladım.
              </span>
            </Typography>
          </div>
          {/*
          <div className="tesvik-footer">
            <InfoOutlinedIcon color="action" fontSize="small" style={{ marginTop: 2 }} />
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#a0a0a0' : '#666', transition: 'color 0.3s ease' }}>
              Yatırımlarda Devlet Yardımları Hakkında <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>Karar</a> ve <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>Tebliğine</a> göre hazırlanmıştır. <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>Kapsam Dışı Konular</a>
            </Typography>
          </div>
          */}
        </form>
        {showResult && (
          <div ref={resultRef} className="tesvik-sonuc-panel" style={{ marginTop: 32 }}>
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
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 32 }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease',
              minWidth: '280px'
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
            </div>
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
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 32 }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease',
              minWidth: '280px'
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
                  </div>
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
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 32 }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease',
              minWidth: '280px'
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
                </div>
            {/* Buradan sonra yeni ekran veya kutular eklenebilir */}
            <hr style={{ 
              margin: '40px 0', 
              border: 0, 
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${mode === 'dark' ? '#404040' : '#e9ecef'} 50%, transparent 100%)`,
              transition: 'background 0.3s ease'
            }} />
            {/* DESTEK UNSURLARI Tablosu */}
                <div className="section-title" style={{ 
                  color: mode === 'dark' ? '#e9ecef' : '#495057',
                  transition: 'color 0.3s ease'
            }}>DESTEK UNSURLARI</div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 32 }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease',
              minWidth: '400px'
            }}>
              <tbody>
                {getDestekUnsurlariByBolge(selectedIl, selectedIlce, osb).map((destek, index) => (
                  <tr key={index}>
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
            </div>
            {/* Detaylı Analiz Butonu */}
            <div style={{ 
              marginTop: 50, 
              marginBottom: 50, 
              display: 'flex', 
              justifyContent: 'center',
              width: '100%',
              position: 'relative',
              zIndex: 10
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (naceValue) {
                    params.set('naceKodu', naceValue.kod);
                    params.set('naceAciklama', naceValue.tanim);
                  }
                  if (selectedIl) params.set('yatirimIli', selectedIl);
                  if (selectedIlce) params.set('yatirimIlcesi', selectedIlce);
                  if (osb) params.set('osb', osb);
                  const bolge = getBolge(selectedIl);
                  if (bolge) params.set('yatirimBolgesi', bolge.toString());
                  const destekBolgesi = getDestekBolgesi(selectedIl, selectedIlce, osb);
                  if (destekBolgesi) params.set('destekBolgesi', destekBolgesi.toString());
                  // Teşvik programı bayrakları
                  if (naceValue) {
                    if (isHedefYatirim(naceValue.kod)) params.set('hedefYatirim', 'true');
                    if (isOncelikliYatirim(naceValue)) params.set('oncelikliYatirim', 'true');
                    if (isYuksekTeknoloji(naceValue.kod)) params.set('yuksekTeknoloji', 'true');
                    if (isOrtaYuksekTeknoloji(naceValue.kod)) params.set('ortaYuksekTeknoloji', 'true');
                  }
                  router.push(`/detayli-analiz?${params.toString()}`);
                }}
                sx={{
                  fontSize: '1.2rem',
                  padding: '16px 48px',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                  minWidth: '280px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.7)',
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                📊 Detaylı Analiz Sayfasına Git
              </Button>
            </div>
            <hr style={{ 
              margin: '40px 0', 
              border: 0, 
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${mode === 'dark' ? '#404040' : '#e9ecef'} 50%, transparent 100%)`,
              transition: 'background 0.3s ease'
            }} />
            {/* DESTEK TÜRLERİ Tablosu */}
            <div className="section-title" style={{ 
              color: mode === 'dark' ? '#e9ecef' : '#495057',
              transition: 'color 0.3s ease'
            }}>DESTEK TÜRLERİ</div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 32 }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              background: mode === 'dark' ? '#2d2d2d' : '#fff', 
              fontSize: '1.08rem',
              transition: 'background-color 0.3s ease',
              minWidth: '400px'
            }}>
              <tbody>
                {destekVerileri.destekTurleri.map((destek, index) => (
                  <tr key={index}>
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
                  </div>
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
            maxWidth: 700,
            maxHeight: '80vh',
            overflowY: 'auto',
            transition: 'background-color 0.3s ease',
          }}
          onScroll={handleTermsScroll}
        >
          <Typography id="terms-modal-title" variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Kullanım Koşulları
          </Typography>
          <Box id="terms-modal-desc" sx={{ mt: 2, color: mode === 'dark' ? '#e0e0e0' : '#333' }}>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              1. Kabul Edilme
          </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.7 }}>
              Lore Danışmanlık web sitesine erişerek veya hizmetlerimizi kullanarak, bu kullanım koşullarının tamamını okuduğunuzu, anladığınızı ve bunlara bağlı kalmayı kabul ettiğinizi beyan etmiş olursunuz. Eğer bu koşullardan herhangi birini kabul etmiyorsanız, lütfen hizmeti kullanmayı durdurun.
            </Typography>

            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              2. Hizmet Tanımı ve Değişiklikler
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.7 }}>
              Lore Danışmanlık, kullanıcılara dijital danışmanlık, içerik analizi ve bilgi paylaşımı hizmetleri sunan bir platformdur. Hizmet kapsamını, içeriğini veya teknik özelliklerini önceden haber vermeksizin değiştirme veya durdurma hakkımızı saklı tutarız.
            </Typography>

            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              3. Kullanıcı Yükümlülükleri
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.7 }}>
              Kullanıcı olarak şunları kabul edersiniz:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 3, lineHeight: 1.8 }}>
              <li><Typography variant="body2" component="span">Hizmeti yasalara aykırı amaçlarla kullanmamak.</Typography></li>
              <li><Typography variant="body2" component="span">Sistemin güvenliğini bozacak, aşırı yük getirecek veya diğer kullanıcıların deneyimini engelleyecek (DDOS, otomatik tarama, veri madenciliği vb.) faaliyetlerde bulunmamak.</Typography></li>
              <li><Typography variant="body2" component="span">Platform üzerinden sunulan veya platform aracılığıyla üretilen içeriklerin doğruluğunu şahsen teyit etmek.</Typography></li>
            </Box>

            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              4. Yapay Zeka ve İçerik Sorumluluğu
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.7 }}>
              Platformumuzda sunulan bazı analizler ve içerikler yapay zeka destekli sistemler tarafından üretilebilir.
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 3, lineHeight: 1.8 }}>
              <li>
                <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>Hatalar: </Typography>
                <Typography variant="body2" component="span">Üretilen bilgilerin %100 doğru, eksiksiz veya güncel olduğu garanti edilmez.</Typography>
              </li>
              <li>
                <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>Sorumluluk: </Typography>
                <Typography variant="body2" component="span">Kullanıcı, Lore Danışmanlık üzerinden aldığı bilgilere dayanarak yaptığı işlemlerden bizzat sorumludur. Bu bilgilere dayanılarak yapılan işlemlerden doğabilecek maddi veya manevi zararlardan Lore Danışmanlık sorumlu tutulamaz.</Typography>
              </li>
            </Box>

            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              5. Fikri Mülkiyet Hakları
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.7 }}>
              Sitede yer alan tüm tasarım, logo, metin, grafik ve yazılım kodlarının mülkiyeti Lore Danışmanlık'a aittir. Yazılı izin olmaksızın bu içeriklerin kopyalanması, çoğaltılması veya ticari amaçla kullanılması yasaktır.
            </Typography>

            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              6. Sorumluluğun Sınırlandırılması
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.7 }}>
              Lore Danışmanlık, hizmetin kesintisiz veya hatasız olacağına dair herhangi bir garanti vermez. Hizmet "olduğu gibi" (as-is) sunulmaktadır. Teknik aksaklıklar, internet kesintileri, veri kayıpları veya üçüncü taraf müdahalelerinden kaynaklanan zararlardan platform sorumlu değildir.
            </Typography>

            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              7. Gizlilik Politikası
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.7 }}>
              Hizmeti kullanırken paylaştığınız veriler ve tarafımızca toplanan bilgiler, Gizlilik Politikamız çerçevesinde işlenir. Lütfen verilerinizin nasıl toplandığını ve saklandığını öğrenmek için ilgili politikayı inceleyin.
            </Typography>

            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              8. İletişim
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.7 }}>
              Bu koşullarla ilgili her türlü soru, görüş ve öneriniz için bizimle aşağıdaki bağlantı üzerinden iletişime geçebilirsiniz:{' '}
              <a 
                href="https://www.lore.com.tr/iletisim/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1976d2', textDecoration: 'underline' }}
              >
                https://www.lore.com.tr/iletisim/
              </a>
            </Typography>
          </Box>
          <Button
            onClick={() => {
              if (!hasScrolledTerms) return;
              setChecked(true);
              setTermsOpen(false);
            }}
            sx={{ mt: 2 }}
            variant="contained"
            color="error"
            fullWidth
            disabled={!hasScrolledTerms}
          >
            Kapat
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
