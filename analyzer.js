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
  const { total: totalTextLength, tooDeep: textTooDeep } =
    getTotalTextLength(message);
  if (textTooDeep)
    return {
      isMalicious: true,
      reason: "Struktur pesan terlalu dalam",
    };
  if (totalTextLength > 20000) {
    return { isMalicious: true, reason: "Panjang teks/caption ekstrem" };
  }

  // Aturan #2: Cek jumlah mention yang gila dari berbagai tipe pesan
  const { count: mentionCount, tooDeep: mentionTooDeep } =
    getMentionCount(message);
  if (mentionTooDeep)
    return {
      isMalicious: true,
      reason: "Struktur pesan terlalu dalam",
    };

  if (mentionCount > 1000) {
    return { isMalicious: true, reason: "Jumlah mention masif" };
  }

  // Aturan #3: Cek interactiveResponseMessage (Bug paramsJson)
  const paramsJson =
    message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
  if (paramsJson && paramsJson.length > 10000) {
    return {
      isMalicious: true,
      reason: "Bug Interactive Response (paramsJson)",
    };
  }

  // Aturan #4: Cek listResponseMessage (Bug judul section)
  const listSections = message.listResponseMessage?.sections;
  if (listSections) {
    const totalTitleLength = listSections.reduce(
      (acc, section) => acc + (section.title?.length || 0),
      0,
    );
    if (totalTitleLength > 50000) {
      return { isMalicious: true, reason: "Bug List Response (section title)" };
    }
  }

  // Aturan #5: Cek carouselMessage (Bug teks di card)
  const carouselCards = message.interactiveMessage?.carouselMessage?.cards;
  if (carouselCards) {
    for (const card of carouselCards) {
      const headerLength = card.header?.title?.length || 0;
      const bodyLength = card.body?.text?.length || 0;
      if (headerLength > 10000 || bodyLength > 10000) {
        return { isMalicious: true, reason: "Bug Carousel (card text)" };
      }
    }
  }

  // Aturan #6: Cek nilai properti media yang mustahil (contoh pada video/dokumen)
  const mediaMsg =
    message.documentMessage ||
    message.videoMessage ||
    message.imageMessage ||
    message.audioMessage;
  if (mediaMsg) {
    const duration = mediaMsg.seconds || 0;
    const fileLength = parseInt(mediaMsg.fileLength || "0", 10);
    const pageCount = mediaMsg.pageCount || 0;
    // Jika durasi > 1 jam ATAU file > 2GB ATAU pageCount > 1jt -> tidak wajar
    if (duration > 3600 || fileLength > 2000000000 || pageCount > 1000000) {
      return {
        isMalicious: true,
        reason: "Bug Media (nilai properti tidak wajar)",
      };
    }
  }

  // Aturan #7: Cek bug pairing code palsu
  const pairingResult = message.nativeFlowResponseMessage?.resultado;
  if (pairingResult && typeof pairingResult === "string") {
    try {
      const parsed = JSON.parse(pairingResult);
      if (parsed?.ws?.config?.waWebSocketUrl) {
        return { isMalicious: true, reason: "Bug Pairing Code Palsu" };
      }
    } catch (e) {
      // Abaikan jika JSON tidak valid
    }
  }

  // Jika lolos semua, pesan dianggap aman
  return { isMalicious: false, reason: null };
}

/**
 * Mendapatkan semua contentTypes secara dinamis
 * @param {import('@whiskeysockets/baileys').WAMessage['message']} message
 * @returns {string[]} Array berisi semua contentTypes yang ada di dalam pesan
 */
function extractMessageTypes(content) {
  if (!content || typeof content !== "object") return [];

  return Object.keys(content).filter(
    (k) =>
      (k === "conversation" || k.includes("Message")) &&
      k !== "senderKeyDistributionMessage" &&
      !!content[k] &&
      typeof content[k] === "object",
  );
}

function getTotalTextLength(message, visited = new Set(), depth = 0) {
  if (!message || typeof message !== "object")
    return { length: 0, tooDeep: false };
  if (visited.has(message)) return { length: 0, tooDeep: false };
  if (depth > 1000) return { length: 0, tooDeep: true };

  visited.add(message);

  let total = 0;
  let tooDeep = false;

  if (typeof message.conversation === "string") {
    total += message.conversation.length;
  }

  const types = extractMessageTypes(message);

  for (const type of types) {
    const obj = message[type];
    if (!obj || typeof obj !== "object") continue;

    total += obj.text?.length || 0;
    total += obj.caption?.length || 0;
    total += obj.contentText?.length || 0;

    const quoted = obj.contextInfo?.quotedMessage;
    if (quoted && typeof quoted === "object") {
      const res = getTotalTextLength(quoted, visited, depth + 1);
      total += res.length;
      if (res.tooDeep) tooDeep = true;
    }
  }

  return { length: total, tooDeep };
}

function getMentionCount(message, visited = new Set(), depth = 0) {
  if (!message || typeof message !== "object")
    return { count: 0, tooDeep: false };
  if (visited.has(message)) return { count: 0, tooDeep: false };
  if (depth > 1000) return { count: 0, tooDeep: true };

  visited.add(message);

  let count = 0;
  let tooDeep = false;

  const types = extractMessageTypes(message);

  for (const type of types) {
    const content = message[type];
    if (!content || typeof content !== "object") continue;

    const mentioned = content.contextInfo?.mentionedJid;
    if (Array.isArray(mentioned)) {
      count += mentioned.length;
    }

    const quoted = content.contextInfo?.quotedMessage;
    if (quoted && typeof quoted === "object") {
      const res = getMentionCount(quoted, visited, depth + 1);
      count += res.count;
      if (res.tooDeep) tooDeep = true;
    }
  }

  return { count, tooDeep };
}

module.exports = { analyzeMessage };
