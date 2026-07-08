const chalk = require('chalk');

class MessageHandler {
  constructor() {
    this.messageCache = new Map();
  }

  async process(sock, msg) {
    try {
      const jid = msg.key.remoteJid;
      const messageId = msg.key.id;
      const sender = msg.key.participant || jid;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

      // Cache message
      this.messageCache.set(messageId, {
        message: msg,
        timestamp: Date.now(),
        sender,
        jid,
        text
      });

      // Clean old cache
      if (this.messageCache.size > 1000) {
        const firstKey = this.messageCache.keys().next().value;
        this.messageCache.delete(firstKey);
      }
    } catch (err) {
      console.error(chalk.red('MessageHandler Error:'), err);
    }
  }

  getMessageById(id) {
    return this.messageCache.get(id);
  }
}

module.exports = { MessageHandler };
