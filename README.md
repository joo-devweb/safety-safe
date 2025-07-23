# safety-safe

[![NPM Version](https://img.shields.io/npm/v/safety-safe?color=red&logo=npm)](https://www.npmjs.com/package/safety-safe)
[![NPM License](https://img.shields.io/npm/l/safety-safe?color=blue)](LICENSE)

Sebuah package NPM sederhana dan ringan untuk mendeteksi dan memfilter pesan bug, crash, atau spam yang berbahaya pada bot WhatsApp yang dibuat dengan Baileys.

## Tujuan

Melindungi bot WhatsApp dari serangan umum seperti:
- Pesan dengan karakter atau caption yang sangat panjang.
- Pesan dengan jumlah mention yang masif.
- Berbagai bug `interactiveMessage`, `listResponseMessage`, `carouselMessage`.
- Pesan media dengan properti palsu (file length/duration yang tidak masuk akal).
- Eksploit pengiriman kode pairing palsu dan lainnya.

## Instalasi

```bash
npm install safety-safe
```

## Penggunaan

`safety-safe` dirancang untuk menjadi **detektor**, bukan eksekutor. Ia memberitahu Anda jika sebuah pesan berbahaya, lalu Anda yang memutuskan tindakan apa yang akan diambil. Berikut adalah contoh cara mengintegrasikannya ke dalam bot Baileys Anda.

```javascript
const { makeWASocket } = require('@whiskeysockets/baileys');
const { analyzeMessage } = require('safety-safe'); // atau import jika menggunakan ESM

const client = makeWASocket({ /* ...konfigurasi Anda */ });

client.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];

    // Abaikan jika pesan tidak valid, dari diri sendiri, atau dari grup
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid.endsWith('@g.us')) {
        return;
    }

    // --- ANALISIS DENGAN SAFETY-SAFE ---
    const { isMalicious, reason } = analyzeMessage(msg.message);

    if (isMalicious) {
        console.log(`[!] Pesan berbahaya terdeteksi dari ${msg.key.remoteJid}.`);
        console.log(`[!] Alasan: ${reason}`);
        
        try {
            // CONTOH AKSI: Hapus pesan dan blokir pengirim
            // 1. Hapus pesan yang berbahaya
            await client.sendMessage(msg.key.remoteJid, { delete: msg.key });
            
            // 2. Blokir pengirimnya
            await client.updateBlockStatus(msg.key.remoteJid, "block");

            console.log(`[!] Aksi berhasil: Pesan dihapus dan pengirim diblokir.`);
        } catch (err) {
            console.error('[!] Gagal melakukan aksi blokir/hapus:', err);
        }
        return; // Hentikan pemrosesan pesan ini
    }

    // Jika pesan aman, lanjutkan dengan logika bot normal Anda
    // console.log(`Pesan aman dari ${msg.key.remoteJid}.`);
    // ... kode bot Anda selanjutnya ...
});
```

## Lisensi

[MIT](LICENSE)
