const chalk = require('chalk');

class AutoViewStatus {
  constructor() {
    this.viewedStatuses = new Map();
  }

  async viewStatus(sock, msg) {
    try {
      const statusJid = msg.key.participant || msg.key.remoteJid;
      const statusId = msg.key.id;

      // Check if already viewed
      if (this.viewedStatuses.has(statusId)) {
        return;
      }

      // Mark as read
      await sock.readMessages([msg.key]);
      this.viewedStatuses.set(statusId, {
        jid: statusJid,
        timestamp: Date.now()
      });

      console.log(chalk.green(`✅ [AUTO-VIEW] Status viewed from ${statusJid}`));

      // Clean old entries
      if (this.viewedStatuses.size > 1000) {
        const firstKey = this.viewedStatuses.keys().next().value;
        this.viewedStatuses.delete(firstKey);
      }
    } catch (err) {
      console.error(chalk.red('Error viewing status:'), err);
    }
  }

  async handleStatusUpdate(sock, msg) {
    try {
      if (msg.message?.statusMessage) {
        await this.viewStatus(sock, msg);
      }
    } catch (err) {
      console.error(chalk.red('Error handling status update:'), err);
    }
  }
}

module.exports = { AutoViewStatus };
