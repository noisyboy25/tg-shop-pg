import 'dotenv/config';
import { Bot } from 'grammy';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error('TELEGRAM_TOKEN not specified in .env file');
  process.exit(1);
}

const bot = new Bot(TELEGRAM_TOKEN);

bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'));
bot.on('message', (ctx) => {
  console.log(ctx.message);
  ctx.reply('Got another message!');
});

bot.start();
