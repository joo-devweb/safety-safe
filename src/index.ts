/**
 * WhatsApp Message Analyzer
 * 
 * A TypeScript library for analyzing WhatsApp messages to detect malicious content.
 * Supports both ESM and CommonJS module systems.
 * 
 * @author Your Name
 * @version 1.0.0
 */

export { analyzeMessage } from './analyzer.js';
export type {
  WhatsAppMessage,
  AnalysisResult,
  AnalysisOptions,
  ContextInfo,
  ExternalAdReply,
  MediaMessage,
  ExtendedTextMessage,
  ImageMessage,
  VideoMessage,
  AudioMessage,
  DocumentMessage,
  StickerMessage,
  ProtocolMessage,
  AlbumMessage,
  InteractiveResponseMessage,
  ListMessage,
  ListResponseMessage,
  ListMessageSection,
  ListMessageRow,
  Button,
  ButtonsMessage,
  InteractiveMessage,
  LocationMessage,
  ContactMessage,
  LiveLocationMessage,
  ProductMessage,
  OrderMessage,
  NativeFlowResponseMessage,
} from './types.js';

// Re-export the main function as default export for convenience
export { analyzeMessage as default } from './analyzer.js';