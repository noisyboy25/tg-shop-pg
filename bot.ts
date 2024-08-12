import 'dotenv/config';
import { Bot } from 'grammy';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error('TELEGRAM_TOKEN not specified in .env file');
  process.exit(1);
}

const bot = new Bot(TELEGRAM_TOKEN);

bot.command('orders', async (ctx) => {
  const res = await fetch(`${process.env.SHOP_URL}/api/orders`);
  if (!res.ok) return;
  const { orders } = await res.json();
  ctx.reply(
    orders
      .map((order: any) => {
        console.log(JSON.stringify(order, null, 2));
        return JSON.stringify(order, null, 2).replace(
          /[, \n]*"image.*"[\n ]*/g,
          ''
        );
      })
      .join('\n')
  );
});

bot.catch((error) => console.error(error));

bot.start();
