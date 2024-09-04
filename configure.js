import rls from 'readline-sync';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve('./apps/bot/.env');

let config = '';

const telegramToken = rls.question('Telegram token: ', { hideEchoBack: true });
if (!telegramToken) {
  console.error('ERROR: Token not specified');
  process.exit(1);
}
config += `TELEGRAM_TOKEN=${telegramToken}\n`;

const channelId = rls.question('Channel ID: ');
if (!channelId) {
  console.error('ERROR: Channel ID not specified');
  process.exit(1);
}
config += `CHANNEL_ID=${channelId}\n`;

const port = rls.question('Port (optional): ');
if (port) config += `PORT=${port}\n`;

fs.writeFileSync(CONFIG_PATH, config);
console.log(`Config file saved to ${CONFIG_PATH}`);
