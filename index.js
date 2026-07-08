const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
require('dotenv').config();

const logger = pino({ transport: { target: 'pino-pretty' } });

const {
  Bot
} = require('./lib/bot');

const bot = new Bot();

async function startBot() {
  console.log(chalk.blue.bold('🤖 Initializing Prince MDX WhatsApp Bot...'));

  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: process.env.DEBUG ? 'debug' : 'silent' }),
    printQRInTerminal: true,
    auth: state,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true
  });

  // Handle connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.cyan('\n📱 Scan QR Code with WhatsApp:'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'connecting') {
      console.log(chalk.yellow('🔄 Connecting...'));
    } else if (connection === 'open') {
      console.log(chalk.green('✅ Bot Connected Successfully!'));
      console.log(chalk.green(`👤 Bot Name: ${process.env.BOT_NAME}`));
      console.log(chalk.green(`📍 Features: Anti-Delete ${process.env.ANTI_DELETE}, Auto View Status ${process.env.AUTO_VIEW_STATUS}`));
    } else if (connection === 'close') {
      let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

      if (reason === DisconnectReason.badSession) {
        console.log(chalk.red('❌ Bad Session File'));
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log(chalk.red('❌ Connection closed'));
      } else if (reason === DisconnectReason.connectionLost) {
        console.log(chalk.red('❌ Connection lost'));
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(chalk.red('❌ Connection replaced'));
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.red('❌ Logged out'));
      } else if (reason === DisconnectReason.restartRequired) {
        console.log(chalk.yellow('🔄 Restart required'));
        startBot();
      } else if (reason === DisconnectReason.timedOut) {
        console.log(chalk.red('❌ Connection timed out'));
      } else {
        console.log(chalk.red(`❌ Disconnected: ${reason}`));
      }
    }
  });

  // Save credentials
  sock.ev.on('creds.update', saveCreds);

  // Handle messages
  sock.ev.on('messages.upsert', async (m) => {
    await bot.handleMessage(sock, m);
  });

  // Handle message edits (for anti-delete)
  sock.ev.on('messages.update', async (m) => {
    await bot.handleMessageUpdate(sock, m);
  });

  // Handle group updates
  sock.ev.on('groups.update', (update) => {
    console.log(chalk.blue(`📢 Group Update: ${JSON.stringify(update)}`));
  });

  return sock;
}

startBot().catch(err => {
  console.error(chalk.red('Error starting bot:'), err);
  process.exit(1);
});
