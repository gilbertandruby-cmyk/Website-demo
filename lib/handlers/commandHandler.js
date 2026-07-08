const chalk = require('chalk');

class CommandHandler {
  constructor() {
    this.prefix = process.env.PREFIX || '.';
    this.commands = new Map();
    this.loadCommands();
  }

  loadCommands() {
    // Built-in commands
    this.commands.set('ping', {
      description: 'Check bot status',
      execute: async (sock, msg) => {
        await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
      }
    });

    this.commands.set('help', {
      description: 'Show all commands',
      execute: async (sock, msg) => {
        let helpText = `╔════════════════════════════╗\n║   ${process.env.BOT_NAME} HELP   ║\n╚════════════════════════════╝\n\n`;
        for (const [cmd, info] of this.commands) {
          helpText += `${this.prefix}${cmd} - ${info.description}\n`;
        }
        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
      }
    });

    this.commands.set('info', {
      description: 'Show bot information',
      execute: async (sock, msg) => {
        const info = `*${process.env.BOT_NAME}* 🤖\n\n*Owner:* ${process.env.OWNER_NAME}\n*Anti-Delete:* ${process.env.ANTI_DELETE}\n*Auto View Status:* ${process.env.AUTO_VIEW_STATUS}`;
        await sock.sendMessage(msg.key.remoteJid, { text: info });
      }
    });
  }

  async handle(sock, msg) {
    try {
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      
      if (!text.startsWith(this.prefix)) return;

      const args = text.slice(this.prefix.length).trim().split(/\s+/);
      const command = args[0].toLowerCase();

      if (this.commands.has(command)) {
        console.log(chalk.yellow(`⚙️  Executing command: ${command}`));
        await this.commands.get(command).execute(sock, msg);
      }
    } catch (err) {
      console.error(chalk.red('CommandHandler Error:'), err);
    }
  }
}

module.exports = { CommandHandler };
