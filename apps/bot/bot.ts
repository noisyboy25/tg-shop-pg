import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';
import express from 'express';
import { Order } from '@tg-shop-pg/common';

const IMAGE_API = process.env.IMAGE_API;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error('TELEGRAM_TOKEN not specified in .env file');
  process.exit(1);
}

const CHANNEL_ID = process.env.CHANNEL_ID;
if (!CHANNEL_ID) {
  console.error('CHANNEL_ID not specified in .env file');
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

bot.start();

const app = express();
app.use(express.json());

const api = express.Router();
app.use('/api', api);

api.get('/', (req, res) => {
  res.json({ message: `Hello from API (${Date.now()})` });
});

const productApi = express.Router();
api.use('/products', productApi);

const getImages = async (limit = 15) => {
  const res = await fetch(
    `${IMAGE_API}/images/random?rating=safe&limit=${limit}`
  );
  const data = await res.json();
  console.dir(data);
  return data.items;
};

const productList: {
  id: string;
  name: string;
  price: number;
  image: string;
}[] = [];
const generateProducts = async () => {
  try {
    const images = await getImages();
    images
      .filter((image: any) => image.tags.length > 0)
      .map((image: any) => {
        const tagIndex = Math.floor(Math.random() * image.tags.length);
        productList.push({
          id: String(image.id),
          name: image.tags[tagIndex].name,
          price: Math.floor(Math.random() * 1000),
          image: image.sample_url,
        });
      });
  } catch (error) {
    console.log(error);
  }
};
generateProducts();

productApi.get('/', (req, res) => {
  res.json({
    products: productList,
  });
});

api.route('/orders').post(async (req, res) => {
  const order: Order = req.body.order;
  order.id = `${Date.now()}`;
  const { id } = order;
  console.dir(order, { depth: null });
  res.json({ message: 'created order', order });
  const formattedCart = order.cart
    .map(
      ({ product, quantity }) =>
        `[${product.id}] (x ${quantity}) ${product.name}  `
    )
    .join('\n');
  const formattedOrder = `<b>ID:</b> ${id}<b>\n<b>Phone:</b> ${order.customer.phone}\n<b>Name:</b> ${order.customer.name}\nCart:</b>\n${formattedCart}`;
  try {
    await bot.api.sendMessage(CHANNEL_ID, formattedOrder, {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error(error);
  }
});

const PORT = process.env.PORT ?? 5000;
try {
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
} catch (error) {
  console.error(error);
}
