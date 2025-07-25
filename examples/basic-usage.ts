#!/usr/bin/env node

import { analyzeMessage, WhatsAppMessage, AnalysisOptions } from '../src/index.js';

// Example 1: Normal message
console.log('=== Example 1: Normal Message ===');
const normalMessage: WhatsAppMessage = {
  conversation: "Hello, how are you doing today?"
};

const result1 = analyzeMessage(normalMessage);
console.log('Result:', result1);
console.log('');

// Example 2: Message with extreme length
console.log('=== Example 2: Extreme Text Length ===');
const longMessage: WhatsAppMessage = {
  conversation: "A".repeat(30000)
};

const result2 = analyzeMessage(longMessage);
console.log('Result:', result2);
console.log('');

// Example 3: Message with too many mentions
console.log('=== Example 3: Mention Bombing ===');
const mentionBombMessage: WhatsAppMessage = {
  extendedTextMessage: {
    text: "Check this out everyone!",
    contextInfo: {
      mentionedJid: new Array(1500).fill("user@s.whatsapp.net")
    }
  }
};

const result3 = analyzeMessage(mentionBombMessage);
console.log('Result:', result3);
console.log('');

// Example 4: Media message with unreasonable properties
console.log('=== Example 4: Media Abuse ===');
const mediaMessage: WhatsAppMessage = {
  videoMessage: {
    caption: "Check out this video!",
    seconds: 7200, // 2 hours
    fileLength: "5000000000", // 5GB
    pageCount: 2000000
  }
};

const result4 = analyzeMessage(mediaMessage);
console.log('Result:', result4);
console.log('');

// Example 5: Using custom options
console.log('=== Example 5: Custom Options ===');
const customOptions: AnalysisOptions = {
  maxTextLength: 1000,
  maxMentionCount: 10,
  maxButtonCount: 5
};

const shortMessage: WhatsAppMessage = {
  conversation: "A".repeat(1500)
};

const result5 = analyzeMessage(shortMessage, customOptions);
console.log('Result with custom options:', result5);
console.log('');

// Example 6: Button flooding
console.log('=== Example 6: Button Flooding ===');
const buttonFloodMessage: WhatsAppMessage = {
  buttonsMessage: {
    buttons: new Array(150).fill({ buttonText: { displayText: "Click me!" } })
  }
};

const result6 = analyzeMessage(buttonFloodMessage);
console.log('Result:', result6);
console.log('');

// Example 7: Invisible character abuse
console.log('=== Example 7: Invisible Character Abuse ===');
const invisibleCharMessage: WhatsAppMessage = {
  conversation: '\u200b'.repeat(6000) + 'visible text'
};

const result7 = analyzeMessage(invisibleCharMessage);
console.log('Result:', result7);
console.log('');

// Example 8: Protocol message abuse
console.log('=== Example 8: Protocol Message Abuse ===');
const protocolMessage: WhatsAppMessage = {
  protocolMessage: {
    type: 29 // Unusual type
  }
};

const result8 = analyzeMessage(protocolMessage);
console.log('Result:', result8);
console.log('');

// Example 9: Fake pairing code
console.log('=== Example 9: Fake Pairing Code ===');
const fakePairingMessage: WhatsAppMessage = {
  nativeFlowResponseMessage: {
    resultado: JSON.stringify({
      ws: {
        config: {
          waWebSocketUrl: "ws://malicious-server.com/ws"
        }
      }
    })
  }
};

const result9 = analyzeMessage(fakePairingMessage);
console.log('Result:', result9);

console.log('\n=== Analysis Complete ===');