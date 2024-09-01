import { createInterface } from 'node:readline/promises';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.resolve('./apps/bot/.env');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = async () => {
  const telegramToken = await rl.question('Telegram token: ');
  if (!telegramToken) return console.error('ERROR: Token not specified');
  const channelId = await rl.question('Channel ID: ');
  if (!channelId) return console.error('ERROR: Channel ID not specified');
  rl.close();

  await fs.writeFile(
    CONFIG_PATH,
    `SHOP_URL=http://localhost:5173
PORT=5000
IMAGE_API=https://api.nekosapi.com/v3
TELEGRAM_TOKEN=${telegramToken}
CHANNEL_ID=${channelId}
`
  );
  console.log(`Config file saved to ${CONFIG_PATH}`);
};
main();
