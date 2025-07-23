/**
 * Menganalisis objek pesan WhatsApp (dari Baileys) untuk mendeteksi potensi bug, spam, atau crash.
 * @param {import('@whiskeysockets/baileys').WAMessage['message']} message - Objek message dari pesan Baileys.
 * @returns {{isMalicious: boolean, reason: string|null}} - Objek hasil analisis.
 */
function analyzeMessage(message) {
  // Pastikan message tidak null atau undefined
  if (!message) {
    return { isMalicious: false, reason: null };
  }

  // Aturan #1: Cek panjang teks/caption yang tidak wajar
  const textLength = message.conversation?.length || message.extendedTextMessage?.text?.length || message.imageMessage?.caption?.length || message.videoMessage?.caption?.length || 0;
  if (textLength > 20000) {
    return { isMalicious: true, reason: 'Panjang teks/caption ekstrem' };
  }

  // Aturan #2: Cek jumlah mention yang gila dari berbagai tipe pesan
  const contextInfo = message.extendedTextMessage?.contextInfo ||
                      message.imageMessage?.contextInfo ||
                      message.videoMessage?.contextInfo ||
                      message.stickerMessage?.contextInfo ||
                      message.interactiveMessage?.contextInfo;
  const mentionCount = contextInfo?.mentionedJid?.length || 0;
  if (mentionCount > 1000) {
    return { isMalicious: true, reason: 'Jumlah mention masif' };
  }
  
  // Aturan #3: Cek interactiveResponseMessage (Bug paramsJson)
  const paramsJson = message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  if (paramsJson && paramsJson.length > 10000) {
      return { isMalicious: true, reason: 'Bug Interactive Response (paramsJson)' };
  }

  // Aturan #4: Cek listResponseMessage (Bug judul section)
  const listSections = message.listResponseMessage?.sections;
  if (listSections) {
      const totalTitleLength = listSections.reduce((acc, section) => acc + (section.title?.length || 0), 0);
      if (totalTitleLength > 50000) {
          return { isMalicious: true, reason: 'Bug List Response (section title)' };
      }
  }

  // Aturan #5: Cek carouselMessage (Bug teks di card)
  const carouselCards = message.interactiveMessage?.carouselMessage?.cards;
  if (carouselCards) {
      for (const card of carouselCards) {
          const headerLength = card.header?.title?.length || 0;
          const bodyLength = card.body?.text?.length || 0;
          if (headerLength > 10000 || bodyLength > 10000) {
              return { isMalicious: true, reason: 'Bug Carousel (card text)' };
          }
      }
  }
  
  // Aturan #6: Cek nilai properti media yang mustahil (contoh pada video/dokumen)
  const mediaMsg = message.documentMessage || message.videoMessage || message.imageMessage;
  if (mediaMsg) {
    const duration = mediaMsg.seconds || 0;
    const fileLength = parseInt(mediaMsg.fileLength || '0', 10);
    const pageCount = mediaMsg.pageCount || 0;
    // Jika durasi > 1 jam ATAU file > 2GB ATAU pageCount > 1jt -> tidak wajar
    if (duration > 3600 || fileLength > 2000000000 || pageCount > 1000000) {
        return { isMalicious: true, reason: 'Bug Media (nilai properti tidak wajar)' };
    }
  }

  // Aturan #7: Cek bug pairing code palsu
  const pairingResult = message.nativeFlowResponseMessage?.resultado;
  if (pairingResult && typeof pairingResult === 'string') {
    try {
        const parsed = JSON.parse(pairingResult);
        if (parsed?.ws?.config?.waWebSocketUrl) {
            return { isMalicious: true, reason: 'Bug Pairing Code Palsu' };
        }
    } catch (e) {
        // Abaikan jika JSON tidak valid
    }
  }

  // Jika lolos semua, pesan dianggap aman
  return { isMalicious: false, reason: null };
}

module.exports = { analyzeMessage };