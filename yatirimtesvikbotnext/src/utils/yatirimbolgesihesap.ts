import ilBolgeData from '../data/il_bolge.json';

// ilBolge'nin tipini belirliyoruz
const ilBolge: Record<string, number> = ilBolgeData;

/**
 * Seçilen il için bölge numarasını döndürür.
 * @param il İl adı
 * @returns Bölge numarası (1-6) veya null
 */
export function getBolge(il: string): number | null {
  if (!il) return null;
  const normalizedIl = il.trim().toLocaleLowerCase("tr-TR");
  const found = Object.entries(ilBolge).find(
    ([key]) => key.toLocaleLowerCase("tr-TR") === normalizedIl
  );
  return found ? found[1] : null;
}

/**
 * Seçilen il, ilçe ve OSB durumu için faydalanacağı destek bölgesini döndürür.
 * @param il İl adı
 * @param ilce İlçe adı
 * @param osb "evet" veya "hayir"
 * @returns Destek bölgesi numarası (1-6) veya null
 */
export function getDestekBolgesi(il: string, ilce: string, osb: string): number | null {
  const bolge = getBolge(il);
  if (!bolge) return null;
  if (ilce && ilce !== "Diğer Tüm İlçeler") {
    if (osb === "evet") {
      return Math.min(bolge + 2, 6);
    } else {
      return Math.min(bolge + 1, 6);
    }
  }
  if (ilce === "Diğer Tüm İlçeler") {
    if (osb === "evet") {
      return Math.min(bolge + 1, 6);
    } else {
      return bolge;
    }
  }
  return bolge;
}

/**
 * Ana bölgeye göre asgari yatırım tutarını döndürür.
 * @param bolge Bölge numarası
 * @returns Asgari yatırım tutarı (string)
 */
export function getAsgariYatirimTutari(bolge: number): string {
  if (bolge === 1 || bolge === 2) {
    return "12.000.000 TL";
  }
  if ([3, 4, 5, 6].includes(bolge)) {
    return "6.000.000 TL";
  }
  return "-";
} 



