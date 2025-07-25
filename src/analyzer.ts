import { WhatsAppMessage, AnalysisResult, AnalysisOptions } from './types.js';

/**
 * Default analysis options
 */
const DEFAULT_OPTIONS: Required<AnalysisOptions> = {
  maxTextLength: 25000,
  maxInvisibleCharCount: 5000,
  maxInvisibleCharRatio: 0.5,
  maxMentionCount: 1000,
  maxAlbumItems: 50,
  maxMediaDuration: 3600,
  maxFileSize: 2000000000,
  maxPageCount: 1000000,
  maxExternalAdReplyLength: 5000,
  maxParamsJsonLength: 10000,
  maxVideoAnnotationAuthorLength: 5000,
  maxListRows: 1000,
  maxButtonCount: 100,
  maxLocationCommentLength: 5000,
  maxContactDisplayNameLength: 5000,
  maxLiveLocationSequenceNumber: 999999999,
  maxProductImageCount: 100,
  maxOrderItemCount: 1000,
};

/**
 * Analyzes a WhatsApp message to detect potentially malicious content
 * @param message - The WhatsApp message to analyze
 * @param options - Optional analysis configuration
 * @returns Analysis result indicating if the message is malicious and the reason
 */
export function analyzeMessage(
  message: WhatsAppMessage | null | undefined,
  options: AnalysisOptions = {}
): AnalysisResult {
  if (!message) {
    return { isMalicious: false, reason: null };
  }

  const config = { ...DEFAULT_OPTIONS, ...options };

  // Extract full text from various message types
  const fullText = 
    message.conversation || 
    message.extendedTextMessage?.text || 
    message.imageMessage?.caption || 
    message.videoMessage?.caption || 
    '';

  // Check for extreme text length
  if (fullText.length > config.maxTextLength) {
    return { isMalicious: true, reason: 'Extreme text length' };
  }

  // Check for high density of invisible characters
  const invisibleCharRegex = /[\u200b-\u200f\u202a-\u202e\uFEFF]/g;
  const invisibleCharCount = (fullText.match(invisibleCharRegex) || []).length;
  
  if (
    invisibleCharCount > config.maxInvisibleCharCount && 
    fullText.length > 0 && 
    (invisibleCharCount / fullText.length > config.maxInvisibleCharRatio)
  ) {
    return { isMalicious: true, reason: 'High density of invisible characters' };
  }

  // Extract context info from various message types
  const contextInfo = 
    message.stickerMessage?.contextInfo || 
    message.imageMessage?.contextInfo || 
    message.videoMessage?.contextInfo || 
    message.audioMessage?.contextInfo || 
    message.documentMessage?.contextInfo || 
    message.extendedTextMessage?.contextInfo ||
    message.interactiveMessage?.contextInfo || 
    message.buttonsMessage?.contextInfo || 
    message.listMessage?.contextInfo;

  // Check for massive mention count
  if (contextInfo?.mentionedJid && contextInfo.mentionedJid.length > config.maxMentionCount) {
    return { isMalicious: true, reason: 'Massive mention count' };
  }

  // Check for unusual protocol message types
  if (message.protocolMessage?.type === 29 || message.protocolMessage?.type === 25) {
    return { isMalicious: true, reason: 'Unusual Protocol Message type detected' };
  }

  // Check for album message with excessive items
  if (message.albumMessage?.messageList && message.albumMessage.messageList.length > config.maxAlbumItems) {
    return { isMalicious: true, reason: 'Forbidden: albumMessage with excessive items' };
  }

  // Check media messages for unreasonable properties
  const mediaMsg = 
    message.documentMessage || 
    message.videoMessage || 
    message.imageMessage || 
    message.audioMessage;

  if (mediaMsg) {
    const duration = mediaMsg.seconds || 0;
    const fileLength = parseInt(String(mediaMsg.fileLength || '0'), 10);
    const pageCount = mediaMsg.pageCount || 0;

    if (
      duration > config.maxMediaDuration || 
      fileLength > config.maxFileSize || 
      pageCount > config.maxPageCount || 
      duration > 9999999 || 
      fileLength > 9999999999
    ) {
      return { isMalicious: true, reason: 'Bug: Media with unreasonable properties' };
    }

    // Check external ad reply
    if (mediaMsg.externalAdReply) {
      const titleLength = mediaMsg.externalAdReply.title?.length || 0;
      const bodyLength = mediaMsg.externalAdReply.body?.length || 0;
      
      if (titleLength > config.maxExternalAdReplyLength || bodyLength > config.maxExternalAdReplyLength) {
        return { isMalicious: true, reason: 'Bug: externalAdReply with oversized text' };
      }
    }
  }

  // Check interactive response message
  if (message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
    const paramsJsonLength = message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson.length;
    if (paramsJsonLength > config.maxParamsJsonLength) {
      return { isMalicious: true, reason: 'Bug: Interactive Response with oversized paramsJson' };
    }
  }

  // Check video annotations
  if (message.videoMessage?.annotations) {
    for (const annotation of message.videoMessage.annotations) {
      const authorLength = annotation.embeddedContent?.embeddedMusic?.author?.length || 0;
      if (authorLength > config.maxVideoAnnotationAuthorLength) {
        return { isMalicious: true, reason: 'Bug: Video Annotations' };
      }
    }
  }

  // Check list message sections
  const listMessageSections = message.listResponseMessage?.sections || message.listMessage?.sections;
  if (listMessageSections?.[0]?.rows && listMessageSections[0].rows.length > config.maxListRows) {
    return { isMalicious: true, reason: 'Bug: List message with excessive rows' };
  }

  // Check button count
  const buttonCount = 
    message.buttonsMessage?.buttons?.length || 
    message.interactiveMessage?.nativeFlowMessage?.buttons?.length || 
    0;
  
  if (buttonCount > config.maxButtonCount) {
    return { isMalicious: true, reason: 'Bug: Message with excessive buttons' };
  }

  // Check various message properties
  if (
    (message.locationMessage?.comment?.length || 0) > config.maxLocationCommentLength ||
    (message.contactMessage?.displayName?.length || 0) > config.maxContactDisplayNameLength ||
    (message.liveLocationMessage?.sequenceNumber || 0) > config.maxLiveLocationSequenceNumber ||
    (message.productMessage?.product?.productImageCount || 0) > config.maxProductImageCount ||
    (message.orderMessage?.itemCount || 0) > config.maxOrderItemCount
  ) {
    return { isMalicious: true, reason: 'Bug: Payload with abnormal specific properties' };
  }

  // Check for fake pairing code
  if (message.nativeFlowResponseMessage?.resultado) {
    try {
      const parsed = JSON.parse(message.nativeFlowResponseMessage.resultado);
      if (parsed?.ws?.config?.waWebSocketUrl) {
        return { isMalicious: true, reason: 'Bug: Fake Pairing Code' };
      }
    } catch (error) {
      // Ignore JSON parsing errors
    }
  }

  return { isMalicious: false, reason: null };
}