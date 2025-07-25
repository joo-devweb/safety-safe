/**
 * Context information that can be attached to various message types
 */
export interface ContextInfo {
  mentionedJid?: string[];
  [key: string]: any;
}

/**
 * External ad reply information
 */
export interface ExternalAdReply {
  title?: string;
  body?: string;
  [key: string]: any;
}

/**
 * Media message base interface
 */
export interface MediaMessage {
  seconds?: number;
  fileLength?: string | number;
  pageCount?: number;
  contextInfo?: ContextInfo;
  externalAdReply?: ExternalAdReply;
  [key: string]: any;
}

/**
 * Extended text message interface
 */
export interface ExtendedTextMessage {
  text?: string;
  contextInfo?: ContextInfo;
  [key: string]: any;
}

/**
 * Image message interface
 */
export interface ImageMessage extends MediaMessage {
  caption?: string;
}

/**
 * Video message interface
 */
export interface VideoMessage extends MediaMessage {
  caption?: string;
  annotations?: Array<{
    embeddedContent?: {
      embeddedMusic?: {
        author?: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  }>;
}

/**
 * Audio message interface
 */
export interface AudioMessage extends MediaMessage {}

/**
 * Document message interface
 */
export interface DocumentMessage extends MediaMessage {}

/**
 * Sticker message interface
 */
export interface StickerMessage {
  contextInfo?: ContextInfo;
  [key: string]: any;
}

/**
 * Protocol message interface
 */
export interface ProtocolMessage {
  type?: number;
  [key: string]: any;
}

/**
 * Album message interface
 */
export interface AlbumMessage {
  messageList?: any[];
  [key: string]: any;
}

/**
 * Interactive response message interface
 */
export interface InteractiveResponseMessage {
  nativeFlowResponseMessage?: {
    paramsJson?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * List message section row interface
 */
export interface ListMessageRow {
  [key: string]: any;
}

/**
 * List message section interface
 */
export interface ListMessageSection {
  rows?: ListMessageRow[];
  [key: string]: any;
}

/**
 * List message interface
 */
export interface ListMessage {
  sections?: ListMessageSection[];
  [key: string]: any;
}

/**
 * List response message interface
 */
export interface ListResponseMessage {
  sections?: ListMessageSection[];
  [key: string]: any;
}

/**
 * Button interface
 */
export interface Button {
  [key: string]: any;
}

/**
 * Buttons message interface
 */
export interface ButtonsMessage {
  buttons?: Button[];
  contextInfo?: ContextInfo;
  [key: string]: any;
}

/**
 * Interactive message interface
 */
export interface InteractiveMessage {
  contextInfo?: ContextInfo;
  nativeFlowMessage?: {
    buttons?: Button[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Location message interface
 */
export interface LocationMessage {
  comment?: string;
  [key: string]: any;
}

/**
 * Contact message interface
 */
export interface ContactMessage {
  displayName?: string;
  [key: string]: any;
}

/**
 * Live location message interface
 */
export interface LiveLocationMessage {
  sequenceNumber?: number;
  [key: string]: any;
}

/**
 * Product message interface
 */
export interface ProductMessage {
  product?: {
    productImageCount?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Order message interface
 */
export interface OrderMessage {
  itemCount?: number;
  [key: string]: any;
}

/**
 * Native flow response message interface
 */
export interface NativeFlowResponseMessage {
  resultado?: string;
  [key: string]: any;
}

/**
 * WhatsApp message interface containing all possible message types
 */
export interface WhatsAppMessage {
  conversation?: string;
  extendedTextMessage?: ExtendedTextMessage;
  imageMessage?: ImageMessage;
  videoMessage?: VideoMessage;
  audioMessage?: AudioMessage;
  documentMessage?: DocumentMessage;
  stickerMessage?: StickerMessage;
  protocolMessage?: ProtocolMessage;
  albumMessage?: AlbumMessage;
  interactiveResponseMessage?: InteractiveResponseMessage;
  interactiveMessage?: InteractiveMessage;
  buttonsMessage?: ButtonsMessage;
  listMessage?: ListMessage;
  listResponseMessage?: ListResponseMessage;
  locationMessage?: LocationMessage;
  contactMessage?: ContactMessage;
  liveLocationMessage?: LiveLocationMessage;
  productMessage?: ProductMessage;
  orderMessage?: OrderMessage;
  nativeFlowResponseMessage?: NativeFlowResponseMessage;
  [key: string]: any;
}

/**
 * Analysis result interface
 */
export interface AnalysisResult {
  isMalicious: boolean;
  reason: string | null;
}

/**
 * Analysis options interface
 */
export interface AnalysisOptions {
  maxTextLength?: number;
  maxInvisibleCharCount?: number;
  maxInvisibleCharRatio?: number;
  maxMentionCount?: number;
  maxAlbumItems?: number;
  maxMediaDuration?: number;
  maxFileSize?: number;
  maxPageCount?: number;
  maxExternalAdReplyLength?: number;
  maxParamsJsonLength?: number;
  maxVideoAnnotationAuthorLength?: number;
  maxListRows?: number;
  maxButtonCount?: number;
  maxLocationCommentLength?: number;
  maxContactDisplayNameLength?: number;
  maxLiveLocationSequenceNumber?: number;
  maxProductImageCount?: number;
  maxOrderItemCount?: number;
}