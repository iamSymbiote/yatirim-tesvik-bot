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
        console.error('⛔ ZORUNLU ALANLAR EKSİK:', missingFields);
      
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
      

    console.log("-----------------------------------------");
    console.log("✅ API'YE GİDEN TERTEMİZ VERİ:", JSON.stringify(cleanedPayload, null, 2));

    // 3. JSON'u string'e çevir ve Base64'e encode et (görüntüdeki örnek gibi)
    // input.json dosyasını oku (bizim durumumuzda JSON objesini string'e çeviriyoruz)
    const payload = JSON.stringify(cleanedPayload);
    const payloadBase64 = Buffer.from(payload, 'utf-8').toString('base64');

    console.log("🚀 LORE'A GİDEN PAYLOAD (JSON):");
    console.table(cleanedPayload);
    console.log("📦 BASE64 ENCODED PAYLOAD (ilk 100 karakter):", payloadBase64.substring(0, 100) + "...");
    console.log("📦 BASE64 ENCODED PAYLOAD (tam uzunluk):", payloadBase64.length, "karakter");

    // 4. Base64 encode edilmiş veriyi API'ye gönder (görüntüdeki örnek gibi)
    // Token route.ts'de kalıyor (güvenlik için)
    const url = 'https://lore.polyglotpro.tr/';
    const token = 'OLP0PBVCXQ3ZH94HIPJV1OVL360EZK';
    
    console.log("📤 LORE API'YE GÖNDERİLEN REQUEST:");
    console.log("   URL:", url);
    console.log("   Method: POST");
    console.log("   Body (Base64, ilk 100 karakter):", payloadBase64.substring(0, 100) + "...");
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: payloadBase64, // Direkt Base64 string gönderiliyor (görüntüdeki örnek gibi)
      // Not: Content-Type application/json olduğu için fetch otomatik olarak string'i gönderir
    });

    console.log("📡 API RESPONSE STATUS:", response.status, response.statusText);

    let result;
    try {
      const responseText = await response.text();
      console.log("📡 API RESPONSE BODY (ilk 500 karakter):", responseText.substring(0, 500));
      
      if (responseText) {
        result = JSON.parse(responseText);
      } else {
        result = { error: 'Empty response' };
      }
    } catch (parseError: any) {
      console.error("❌ RESPONSE PARSE HATASI:", parseError.message);
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
      console.error("❌ API HATASI:", result);
      return NextResponse.json(
        {
          status: 'error',
          message: result.message || result.error || 'API hatası',
          details: result
        },
        { status: response.status }
      );
    }

    console.log("✅ API BAŞARILI YANIT:", result);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("🔥 İÇ HATA:", error.message);
    return NextResponse.json({ error: 'Sistem Hatası' }, { status: 500 });
  }
}