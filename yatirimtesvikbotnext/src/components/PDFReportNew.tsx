import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    fontFamily: 'Helvetica',
    padding: 40,
    fontSize: 11,
    color: '#000',
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottom: '2px solid #000',
    paddingBottom: 20,
  },
  logoSection: {
    width: '80px',
    height: '80px',
    border: '2px solid #000',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  logoText: {
    fontSize: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tcTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  ministry: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  barcodeSection: {
    width: '120px',
    height: '80px',
    border: '1px solid #000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcode: {
    fontSize: 8,
    textAlign: 'center',
  },
  
  // Form Section
  formSection: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  formLabel: {
    width: '120px',
    fontSize: 10,
    fontWeight: 'bold',
  },
  formValue: {
    flex: 1,
    fontSize: 10,
    borderBottom: '1px solid #000',
    paddingBottom: 2,
    marginRight: 20,
  },
  
  // Table Section
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    border: '1px solid #000',
    borderBottom: 'none',
  },
  tableRow: {
    flexDirection: 'row',
    border: '1px solid #000',
    borderTop: 'none',
  },
  tableCell: {
    padding: 8,
    fontSize: 9,
    borderRight: '1px solid #000',
    textAlign: 'center',
  },
  tableCellLeft: {
    padding: 8,
    fontSize: 9,
    borderRight: '1px solid #000',
    textAlign: 'left',
  },
  col1: { width: '15%' },
  col2: { width: '25%' },
  col3: { width: '35%' },
  col4: { width: '25%' },
  
  // Result Section
  resultSection: {
    marginTop: 30,
    border: '2px solid #000',
    padding: 15,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    border: '1px solid #000',
    backgroundColor: '#f0f0f0',
  },
  
  // Footer Section
  footer: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    border: '1px solid #000',
    padding: 10,
    width: '150px',
  },
  footerTitle: {
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 5,
  },
  footerDate: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

interface PDFReportProps {
  reportData: {
    il: string;
    ilce: string;
    nace: any;
    osb: string;
    bolge: number;
    destekBolgesi: string;
    asgariYatirimTutari: number;
    isHedefYatirim: boolean;
    isYuksekTeknoloji: boolean;
    isOrtaYuksekTeknoloji: boolean;
    isOncelikliYatirim: boolean;
    destekUnsurlar: any[];
  };
}

const YatirimTesvikRaporu: React.FC<PDFReportProps> = ({ reportData }) => {
  const currentDate = new Date().toLocaleDateString('tr-TR');
  const reportNumber = `YTR${Date.now().toString().slice(-8)}`;
  
  // Null kontrolleri
  if (!reportData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Rapor verisi bulunamadı.</Text>
        </Page>
      </Document>
    );
  }

  const {
    il = 'Bilinmiyor',
    ilce = 'Bilinmiyor', 
    nace = { kod: '', tanim: '' },
    osb = 'hayir',
    bolge = 1,
    destekBolgesi = 'Bilinmiyor',
    isHedefYatirim = false,
    isYuksekTeknoloji = false,
    isOrtaYuksekTeknoloji = false,
    isOncelikliYatirim = false,
    destekUnsurlar = []
  } = reportData;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>T.C.</Text>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.tcTitle}>T.C.</Text>
            <Text style={styles.ministry}>SANAYİ VE TEKNOLOJİ BAKANLIĞI</Text>
            <Text style={styles.reportTitle}>YATIRIM TEŞVİK DEĞERLENDİRME RAPORU</Text>
          </View>
          
          <View style={styles.barcodeSection}>
            <Text style={styles.barcode}>|||||||||||||||||||</Text>
            <Text style={styles.barcode}>{reportNumber}</Text>
          </View>
        </View>

        {/* Rapor Bilgileri */}
        <View style={styles.formSection}>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Rapor No:</Text>
            <Text style={styles.formValue}>{reportNumber}</Text>
            <Text style={styles.formLabel}>Tarih:</Text>
            <Text style={styles.formValue}>{currentDate}</Text>
          </View>
        </View>

        {/* Yatırım Bilgileri */}
        <View style={styles.formSection}>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>İl:</Text>
            <Text style={styles.formValue}>{il}</Text>
            <Text style={styles.formLabel}>İlçe:</Text>
            <Text style={styles.formValue}>{ilce}</Text>
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>NACE Kodu:</Text>
            <Text style={styles.formValue}>{nace?.kod || '-'}</Text>
            <Text style={styles.formLabel}>Bölge:</Text>
            <Text style={styles.formValue}>{bolge}. Bölge</Text>
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Sektör:</Text>
            <Text style={styles.formValue}>{nace?.tanim || '-'}</Text>
          </View>
          
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>OSB:</Text>
            <Text style={styles.formValue}>{osb === 'evet' ? 'EVET' : 'HAYIR'}</Text>
            <Text style={styles.formLabel}>Destek Bölgesi:</Text>
            <Text style={styles.formValue}>{destekBolgesi}</Text>
          </View>
        </View>

        {/* Değerlendirme Tablosu */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.col1]}>Kriter</Text>
            <Text style={[styles.tableCell, styles.col2]}>Durum</Text>
            <Text style={[styles.tableCell, styles.col3]}>Açıklama</Text>
            <Text style={[styles.tableCell, styles.col4]}>Değerlendirme</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLeft, styles.col1]}>Hedef Yatırım</Text>
            <Text style={[styles.tableCell, styles.col2]}>{isHedefYatirim ? 'EVET' : 'HAYIR'}</Text>
            <Text style={[styles.tableCellLeft, styles.col3]}>Stratejik yatırım konuları kapsamında</Text>
            <Text style={[styles.tableCell, styles.col4]}>{isHedefYatirim ? 'UYGUN' : 'UYGUN DEĞİL'}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLeft, styles.col1]}>Yüksek Teknoloji</Text>
            <Text style={[styles.tableCell, styles.col2]}>{isYuksekTeknoloji ? 'EVET' : 'HAYIR'}</Text>
            <Text style={[styles.tableCellLeft, styles.col3]}>Yüksek teknoloji sektörü kapsamında</Text>
            <Text style={[styles.tableCell, styles.col4]}>{isYuksekTeknoloji ? 'UYGUN' : 'UYGUN DEĞİL'}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLeft, styles.col1]}>Orta-Yüksek Teknoloji</Text>
            <Text style={[styles.tableCell, styles.col2]}>{isOrtaYuksekTeknoloji ? 'EVET' : 'HAYIR'}</Text>
            <Text style={[styles.tableCellLeft, styles.col3]}>Orta-yüksek teknoloji sektörü kapsamında</Text>
            <Text style={[styles.tableCell, styles.col4]}>{isOrtaYuksekTeknoloji ? 'UYGUN' : 'UYGUN DEĞİL'}</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLeft, styles.col1]}>Öncelikli Yatırım</Text>
            <Text style={[styles.tableCell, styles.col2]}>{isOncelikliYatirim ? 'EVET' : 'HAYIR'}</Text>
            <Text style={[styles.tableCellLeft, styles.col3]}>Öncelikli yatırım konuları kapsamında</Text>
            <Text style={[styles.tableCell, styles.col4]}>{isOncelikliYatirim ? 'UYGUN' : 'UYGUN DEĞİL'}</Text>
          </View>
        </View>

        {/* Destek Unsurları */}
        {destekUnsurlar && Array.isArray(destekUnsurlar) && destekUnsurlar.length > 0 && (
          <View style={styles.table}>
            <Text style={[styles.resultTitle, { marginBottom: 10 }]}>DESTEK UNSURLARI</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { width: '100%' }]}>Destek Türü</Text>
            </View>
            {destekUnsurlar.map((destek, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCellLeft, { width: '100%' }]}>
                  {typeof destek === 'string' ? destek : destek?.toString() || 'Bilinmiyor'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Sonuç */}
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>DEĞERLENDİRME SONUCU</Text>
          <Text style={styles.resultStatus}>
            {destekUnsurlar && Array.isArray(destekUnsurlar) && destekUnsurlar.length > 0 ? 'TEŞVİK UYGUN' : 'TEŞVİK UYGUN DEĞİL'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Rapor Tarihi</Text>
          <Text style={styles.footerDate}>{currentDate}</Text>
        </View>
      </Page>
    </Document>
  );
};

export const generateAndDownloadPDF = async (reportData: any) => {
  try {
    console.log('PDF oluşturuluyor...', reportData);
    
    // reportData'yı doğru şekilde YatirimTesvikRaporu'ya geçir
    const blob = await pdf(
      <YatirimTesvikRaporu reportData={reportData} />
    ).toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yatirim-tesvik-raporu-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('PDF başarıyla oluşturuldu!');
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    throw error;
  }
};