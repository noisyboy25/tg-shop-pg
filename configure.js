import rls from 'readline-sync';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve('./apps/bot/.env');

const telegramToken = rls.question('Telegram token: ', { hideEchoBack: true });
if (!telegramToken) {
  console.error('ERROR: Token not specified');
  process.exit(1);
}
const channelId = rls.question('Channel ID: ');
if (!channelId) {
  console.error('ERROR: Channel ID not specified');
  process.exit(1);
}

fs.writeFileSync(
  CONFIG_PATH,
  `PORT=5000
TELEGRAM_TOKEN=${telegramToken}
CHANNEL_ID=${channelId}
`
);
console.log(`Config file saved to ${CONFIG_PATH}`);
