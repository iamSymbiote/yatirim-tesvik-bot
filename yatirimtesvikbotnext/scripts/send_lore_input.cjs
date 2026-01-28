#!/usr/bin/env node

/**
 * Lore AI test script
 *
 * Kullanım:
 *   node scripts/send_lore_input.cjs             // projenin kök dizininde input.json arar
 *   node scripts/send_lore_input.cjs path/to/file.json
 *
 * PHP örneği ile aynı mantık:
 * - JSON dosyasını okur
 * - Base64'e çevirir
 * - Lore API'ye Authorization header ile POST eder
 * - Yanıtı stdout'a basar
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const LORE_URL = 'https://lore.polyglotpro.tr/';
const LORE_TOKEN = 'OLP0PBVCXQ3ZH94HIPJV1OVL360EZK';

// Argümanlardan dosya yolu al; yoksa varsayılan input.json
const inputPathArg = process.argv[2] || 'input.json';
const inputPath = path.isAbsolute(inputPathArg)
  ? inputPathArg
  : path.join(process.cwd(), inputPathArg);

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`[Lore] input dosyası bulunamadı: ${inputPath}`);
    process.exit(1);
  }

  const payload = fs.readFileSync(inputPath, 'utf8');

  // PHP örneğindeki gibi: JSON string'i Base64'e çevir
  const payloadBase64 = Buffer.from(payload, 'utf8').toString('base64');

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': LORE_TOKEN,
    },
    // Güvenlik notu:
    // PHP örneğinde CURLOPT_SSL_VERIFYPEER/VERIFYHOST false.
    // Aynısını yapmak için rejectUnauthorized: false kullanıyoruz.
    // Üretimde gerçek sertifika ile kullanırken bunu kaldırmanız önerilir.
    rejectUnauthorized: false,
  };

  const req = https.request(LORE_URL, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(data || '');
    });
  });

  req.on('error', (err) => {
    console.error('[Lore] İstek hatası:', err.message);
    process.exit(1);
  });

  req.write(payloadBase64);
  req.end();
}

main();

