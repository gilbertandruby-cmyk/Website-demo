const chalk = require('chalk');
const { MessageHandler } = require('./handlers/messageHandler');
const { CommandHandler } = require('./handlers/commandHandler');
const { AntiDelete } = require('./features/antiDelete');
const { AutoViewStatus } = require('./features/autoViewStatus');

class Bot {
  constructor() {
    this.messageHandler = new MessageHandler();
    this.commandHandler = new CommandHandler();
    this.antiDelete = new AntiDelete();
    this.autoViewStatus = new AutoViewStatus();
    this.deletedMessages = new Map();
  }

  async handleMessage(sock, m) {
    try {
      const messages = m.messages;

      for (const msg of messages) {
        // Store message for anti-delete
        if (msg.message) {
          this.antiDelete.storeMessage(msg.key.id, msg);
        }

        // Handle command
        if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
          const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
          const jid = msg.key.remoteJid;
          const isGroup = jid.endsWith('@g.us');
          const sender = msg.key.participant || jid;
          const isFromMe = msg.key.fromMe;

          console.log(chalk.cyan(`\n📨 [${isFromMe ? 'YOU' : 'OTHER'}] ${sender}: ${text.substring(0, 50)}...`));

          if (process.env.AUTO_VIEW_STATUS === 'true' && msg.message?.imageMessage?.mediaKey) {
            await this.autoViewStatus.viewStatus(sock, msg);
          }
        }
      }
    } catch (err) {
      console.error(chalk.red('Error handling message:'), err);
    }
  }

  async handleMessageUpdate(sock, m) {
    try {
      for (const { key, update } of m) {
        if (process.env.ANTI_DELETE === 'true') {
          if (update.deleteForEveryone) {
            const deletedMsg = this.antiDelete.getDeletedMessage(key.id);
            if (deletedMsg) {
              await this.antiDelete.restoreMessage(sock, deletedMsg, key.remoteJid);
            }
          }
        }
      }
    } catch (err) {
      console.error(chalk.red('Error handling message update:'), err);
    }
  }
}

module.exports = { Bot };
