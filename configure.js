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
  const channelId = await rl.question('Channel ID: ');
  rl.close();

  await fs.writeFile(
    CONFIG_PATH,
    `TELEGRAM_TOKEN=${telegramToken}\nCHANNEL_ID=${channelId}\n`
  );
  console.log(`Config file saved to ${CONFIG_PATH}`);
};
main();
