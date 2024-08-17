import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error('TELEGRAM_TOKEN not specified in .env file');
  process.exit(1);
}

const bot = new Bot(TELEGRAM_TOKEN);

bot.catch((err) => {
  console.log({ err });
});

bot.command('start', async (ctx) => {
  const botUsername = (await ctx.api.getMe()).username;
  await ctx.reply('Open App', {
    reply_markup: new InlineKeyboard().url(
      'Open App',
      `https://t.me/${botUsername}?startapp`
    ),
  });
});

bot.command('orders', async (ctx) => {
  const res = await fetch(`${process.env.SHOP_URL}/api/orders`);
  if (!res.ok) return;
  const { orders } = await res.json();
  await ctx.reply(
    orders
      .map((order: any) => {
        return JSON.stringify(order, null, 4).replace(
          /[, \n]*"image.*"[\n ]*/g,
          ''
        );
      })
      .join('\n')
  );
});

bot.start();
