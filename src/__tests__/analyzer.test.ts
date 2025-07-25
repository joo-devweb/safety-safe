import { analyzeMessage } from '../analyzer';
import { WhatsAppMessage } from '../types';

describe('analyzeMessage', () => {
  it('should return non-malicious for null/undefined messages', () => {
    expect(analyzeMessage(null)).toEqual({ isMalicious: false, reason: null });
    expect(analyzeMessage(undefined)).toEqual({ isMalicious: false, reason: null });
  });

  it('should return non-malicious for empty message', () => {
    const message: WhatsAppMessage = {};
    const result = analyzeMessage(message);
    expect(result).toEqual({ isMalicious: false, reason: null });
  });

  it('should detect extreme text length', () => {
    const longText = 'a'.repeat(26000);
    const message: WhatsAppMessage = {
      conversation: longText
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Extreme text length');
  });

  it('should detect high density of invisible characters', () => {
    const invisibleChars = '\u200b'.repeat(6000);
    const message: WhatsAppMessage = {
      conversation: invisibleChars + 'normal text'
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('High density of invisible characters');
  });

  it('should detect massive mention count', () => {
    const message: WhatsAppMessage = {
      extendedTextMessage: {
        text: 'Hello',
        contextInfo: {
          mentionedJid: new Array(1001).fill('user@s.whatsapp.net')
        }
      }
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Massive mention count');
  });

  it('should detect unusual protocol message types', () => {
    const message: WhatsAppMessage = {
      protocolMessage: {
        type: 29
      }
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Unusual Protocol Message type detected');
  });

  it('should detect excessive album items', () => {
    const message: WhatsAppMessage = {
      albumMessage: {
        messageList: new Array(51).fill({})
      }
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Forbidden: albumMessage with excessive items');
  });

  it('should detect media with unreasonable properties', () => {
    const message: WhatsAppMessage = {
      videoMessage: {
        seconds: 4000, // More than 1 hour
        fileLength: '3000000000' // More than 2GB
      }
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Bug: Media with unreasonable properties');
  });

  it('should detect oversized external ad reply', () => {
    const longText = 'a'.repeat(6000);
    const message: WhatsAppMessage = {
      imageMessage: {
        externalAdReply: {
          title: longText,
          body: 'normal body'
        }
      }
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Bug: externalAdReply with oversized text');
  });

  it('should detect excessive buttons', () => {
    const message: WhatsAppMessage = {
      buttonsMessage: {
        buttons: new Array(101).fill({})
      }
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Bug: Message with excessive buttons');
  });

  it('should detect fake pairing code', () => {
    const message: WhatsAppMessage = {
      nativeFlowResponseMessage: {
        resultado: JSON.stringify({
          ws: {
            config: {
              waWebSocketUrl: 'ws://malicious.com'
            }
          }
        })
      }
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Bug: Fake Pairing Code');
  });

  it('should handle invalid JSON in nativeFlowResponseMessage', () => {
    const message: WhatsAppMessage = {
      nativeFlowResponseMessage: {
        resultado: 'invalid json {'
      }
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(false);
    expect(result.reason).toBe(null);
  });

  it('should allow custom options', () => {
    const message: WhatsAppMessage = {
      conversation: 'a'.repeat(1000)
    };
    
    const result = analyzeMessage(message, { maxTextLength: 500 });
    expect(result.isMalicious).toBe(true);
    expect(result.reason).toBe('Extreme text length');
  });

  it('should return non-malicious for normal message', () => {
    const message: WhatsAppMessage = {
      conversation: 'Hello, how are you?'
    };
    
    const result = analyzeMessage(message);
    expect(result.isMalicious).toBe(false);
    expect(result.reason).toBe(null);
  });
});
