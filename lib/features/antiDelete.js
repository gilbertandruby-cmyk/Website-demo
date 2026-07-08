const chalk = require('chalk');

class AntiDelete {
  constructor() {
    this.messageStore = new Map();
    this.maxStored = 500;
  }

  storeMessage(messageId, msg) {
    try {
      this.messageStore.set(messageId, {
        message: msg,
        timestamp: Date.now(),
        sender: msg.key.participant || msg.key.remoteJid,
        text: this.extractText(msg),
        type: this.getMessageType(msg)
      });

      // Manage storage
      if (this.messageStore.size > this.maxStored) {
        const firstKey = this.messageStore.keys().next().value;
        this.messageStore.delete(firstKey);
      }
    } catch (err) {
      console.error(chalk.red('Error storing message:'), err);
    }
  }

  extractText(msg) {
    if (msg.message?.conversation) return msg.message.conversation;
    if (msg.message?.extendedTextMessage?.text) return msg.message.extendedTextMessage.text;
    if (msg.message?.imageMessage?.caption) return msg.message.imageMessage.caption;
    if (msg.message?.videoMessage?.caption) return msg.message.videoMessage.caption;
    return '[Media Message]';
  }

  getMessageType(msg) {
    if (msg.message?.conversation || msg.message?.extendedTextMessage) return 'text';
    if (msg.message?.imageMessage) return 'image';
    if (msg.message?.videoMessage) return 'video';
    if (msg.message?.audioMessage) return 'audio';
    return 'unknown';
  }

  getDeletedMessage(messageId) {
    return this.messageStore.get(messageId);
  }

  async restoreMessage(sock, deletedMsg, jid) {
    try {
      console.log(chalk.yellow(`🚨 [ANTI-DELETE] Message recovered from ${deletedMsg.sender}`));
      
      const senderName = deletedMsg.sender.split('@')[0];
      const restoredText = `*[MESSAGE RECOVERED - ANTI-DELETE ACTIVE]* 🔄\n\n*From:* @${senderName}\n*Type:* ${deletedMsg.type}\n*Content:* ${deletedMsg.text}`;
      
      await sock.sendMessage(jid, {
        text: restoredText,
        mentions: [deletedMsg.sender]
      });
    } catch (err) {
      console.error(chalk.red('Error restoring message:'), err);
    }
  }

  clearStore() {
    this.messageStore.clear();
  }
}

module.exports = { AntiDelete };
