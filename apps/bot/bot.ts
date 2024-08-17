import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';
import express from 'express';

const IMAGE_API = process.env.IMAGE_API;

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
};
generateProducts();

productApi.get('/', (req, res) => {
  res.json({
    products: productList,
  });
});

api.route('/orders').post(async (req, res) => {
  const { order } = req.body;
  order.id = Date.now();
  console.dir(order, { depth: null });
  res.json({ message: 'created order', order });
  try {
    await bot.api.sendMessage(-1002169127017, JSON.stringify(order, null, 4));
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
