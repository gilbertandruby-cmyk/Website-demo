# Elvis Bot 🤖

A powerful WhatsApp bot with anti-delete messages and auto view status features.

## Features ✨

- **Anti-Delete Messages** 🚨 - Recovers deleted messages and shows them in the chat
- **Auto View Status** 👁️ - Automatically views status updates without leaving a read receipt
- **Command System** ⚙️ - Extensible command handler
- **Multi-device Support** 📱 - Works with multiple WhatsApp accounts
- **Message Caching** 💾 - Stores messages for recovery
- **Real-time Processing** ⚡ - Instant message handling

## Installation 📦

```bash
# Clone the repository
git clone https://github.com/yourusername/elvis-bot.git
cd elvis-bot

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

## Configuration ⚙️

Edit `.env` file with your settings:

```env
BOT_NAME=Elvis Bot
OWNER_NAME=Your Name
OWNER_NUMBER=2348000000000
PREFIX=.
ANTI_DELETE=true
AUTO_VIEW_STATUS=true
AUTO_REPLY=false
DEBUG=false
```

## Usage 🚀

```bash
# Start the bot
npm start

# Development mode with auto-reload
npm run dev
```

### Scan QR Code

1. Run the bot
2. A QR code will appear in the terminal
3. Open WhatsApp on your phone
4. Go to Settings → Linked Devices → Link a Device
5. Scan the QR code
6. Bot will start running!

## Commands 💬

### Built-in Commands

- `.ping` - Check if bot is alive
- `.help` - Show all available commands
- `.info` - Show bot information

## How It Works 🔧

### Anti-Delete Feature

1. Bot stores all incoming messages in memory
2. When someone deletes a message
3. Bot detects the deletion event
4. Bot restores the deleted message with:
   - Sender information
   - Message type
   - Original content
5. Sends it back to the chat

### Auto View Status Feature

1. Bot automatically detects incoming status updates
2. Marks them as read without a "seen" indicator
3. Logs the action in console
4. Maintains a view history

## Project Structure 📁

```
.
├── index.js                 # Main entry point
├── package.json            # Dependencies
├── .env.example            # Environment variables template
├── auth/                   # WhatsApp authentication (auto-generated)
├── lib/
│   ├── bot.js             # Main bot class
│   ├── handlers/
│   │   ├── messageHandler.js  # Message processing
│   │   └── commandHandler.js  # Command execution
│   └── features/
│       ├── antiDelete.js      # Anti-delete functionality
│       └── autoViewStatus.js  # Auto view status functionality
└── README.md              # This file
```

## Dependencies 📚

- `@whiskeysockets/baileys` - WhatsApp Web automation
- `qrcode-terminal` - QR code display in terminal
- `chalk` - Terminal color output
- `dotenv` - Environment variable management
- `pino` - Logging library
- `pino-pretty` - Pretty logging

## Advanced Features 🔮

### Message Storage

- Maximum 500 messages stored in memory
- Automatic cleanup of old messages
- Fast lookup by message ID

### Status Viewing

- Tracks viewed statuses to prevent duplicates
- Automatic cleanup of old entries
- Silent viewing without notifications

### Error Handling

- Comprehensive error logging
- Connection management
- Auto-reconnection on disconnect

## Troubleshooting 🐛

### Bot won't start

```bash
# Make sure Node.js is installed
node --version

# Clear auth folder and try again
rm -rf auth/
npm start
```

### QR code not appearing

- Make sure terminal supports graphics
- Try zooming out in terminal
- Use a different terminal emulator

### Messages not being recovered

- Ensure `ANTI_DELETE=true` in `.env`
- Check console for errors
- Make sure bot is running before message is deleted

## License 📄

MIT License - Feel free to use and modify

## Credits 👏

- Built with ❤️ as Elvis Bot
- Uses Baileys library
- WhatsApp Web automation

## Support 💬

For issues and questions:
- Create an issue on GitHub
- Check existing issues first
- Provide detailed error logs

## Disclaimer ⚠️

This bot is for educational purposes. Use responsibly and respect WhatsApp's Terms of Service. Unauthorized automation may result in account suspension.
