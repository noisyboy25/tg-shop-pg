import 'dotenv/config';
import { Bot } from 'grammy';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error('TELEGRAM_TOKEN not specified in .env file');
  process.exit(1);
}

const bot = new Bot(TELEGRAM_TOKEN);

bot.catch((error) => console.error(error));

bot.start();
