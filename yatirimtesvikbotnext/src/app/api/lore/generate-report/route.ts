import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Veriyi birleştir (Flatten)
    const rawData = {
      ...(body.sorguVerileri || {}),
      ...(body.formVerileri || {})
    };

    const REQUIRED_FIELDS = [
        'naceKodu',
        'yatirimBolgesi',
        'destekBolgesi',
        'yatirimIli',
        'yatirimIlcesi'
      ];
      
      const missingFields = REQUIRED_FIELDS.filter(
        (field) =>
          rawData[field] === undefined ||
          rawData[field] === null ||
          rawData[field] === ''
      );
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Zorunlu alanlar eksik',
            missingFields
          },
          { status: 400 }
        );
      }
      

    // 2. VERİLERİ API'NİN SEVECEĞİ FORMATA SOK (Her şey String ve Noktasız)
    const cleanedPayload = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => {
          if (value === null || value === undefined) return [key, ""];
      
          let stringValue = String(value).trim();
      
          // boolean gelirse Lore sevmez
          if (typeof value === 'boolean') {
            stringValue = value ? 'true' : 'false';
          }
      
          const numericFields = [
            'ithalMakine',
            'yerliMakine',
            'binaInsaat',
            'digerGiderler',
            'sabitYatirimTutari',
            'ilaveIstihdam',
            'mevcutIstihdam',
            'faaliyetSuresi',
            'tamamlanmaSuresiAy'
          ];
      
          if (numericFields.includes(key)) {
            stringValue = stringValue.replace(/\./g, '');
            if (stringValue === '') stringValue = '0';
          }
      
          return [key, stringValue];
        })
      );
      

    // 3. JSON'u string'e çevir ve Base64'e encode et (görüntüdeki örnek gibi)
    // input.json dosyasını oku (bizim durumumuzda JSON objesini string'e çeviriyoruz)
    const payload = JSON.stringify(cleanedPayload);
    const payloadBase64 = Buffer.from(payload, 'utf-8').toString('base64');

    // 4. Base64 encode edilmiş veriyi API'ye gönder (görüntüdeki örnek gibi)
    // Token route.ts'de kalıyor (güvenlik için)
    const url = 'https://lore.polyglotpro.tr/';
    const token = 'OLP0PBVCXQ3ZH94HIPJV1OVL360EZK';
    const LORE_TIMEOUT_MS = 180_000; // 3 dakika

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LORE_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: payloadBase64,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let result;
    try {
      const responseText = await response.text();
      if (responseText) {
        result = JSON.parse(responseText);
      } else {
        result = { error: 'Empty response' };
      }
    } catch (parseError: any) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'API yanıtı parse edilemedi',
          details: parseError.message 
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          message: result.message || result.error || 'API hatası',
          details: result
        },
        { status: response.status }
      );
    }

    // .docx URL → .pdf URL; frontend PDF indir butonu kullanıyor
    let pdfUrl = result.download_docx_url ?? result.download_pdf_url ?? result.download_url;
    if (pdfUrl && typeof pdfUrl === 'string' && /\.docx$/i.test(pdfUrl)) {
      pdfUrl = pdfUrl.replace(/\.docx$/i, '.pdf');
    }
    const out = { ...result };
    if (pdfUrl) out.download_pdf_url = pdfUrl;

    return NextResponse.json(out);

  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    if (isAbort) {
      return NextResponse.json(
        { error: 'LORE API 3 dakika içinde yanıt vermedi. Lütfen kısa süre sonra tekrar deneyin.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Sistem Hatası' }, { status: 500 });
  }
}