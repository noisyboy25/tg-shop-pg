import dotenvx from '@dotenvx/dotenvx';
dotenvx.config();
import { Bot, Context, InlineKeyboard, session } from 'grammy';
import express from 'express';
import { Order, Product } from '@tg-shop-pg/common';
import { Menu } from '@grammyjs/menu';
import {
  Conversation,
  createConversation,
  ConversationFlavor,
  conversations,
} from '@grammyjs/conversations';

const IMAGE_API = process.env.IMAGE_API;

let MINIAPP_URL = '';

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

const productList: Product[] = [];

const getImages = async (limit = 15) => {
  const res = await fetch(
    `${IMAGE_API}/images/random?rating=safe&limit=${limit}`
  );
  const data = await res.json();
  console.dir(data);
  return data.items;
};

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

type MyContext = Context & ConversationFlavor;

const bot = new Bot<MyContext>(TELEGRAM_TOKEN);

bot.catch((err) => {
  console.log({ err });
});

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

const adminMenu = new Menu<MyContext>('admin-menu').submenu(
  'Products',
  'products-menu'
);

type ProductFormConversation = Conversation<MyContext>;

const productForm = async (
  conversation: ProductFormConversation,
  ctx: MyContext
) => {
  await ctx.reply('Product name:');
  const { message } = await conversation.wait();
  if (!message?.text) return;
  await addProduct(message.text);
  await ctx.reply(`Product name is ${message.text}`);
};
bot.use(createConversation(productForm));

const productsMenu = new Menu<MyContext>('products-menu')
  .text('Add product', async (ctx) => {
    await ctx.conversation.enter('productForm');
  })
  .back('Back');

adminMenu.register(productsMenu);
bot.use(adminMenu);

bot.command('start', async (ctx) => {
  await ctx.reply('Open App', {
    reply_markup: new InlineKeyboard().url('Open App', MINIAPP_URL),
  });
});

bot.command('admin', async (ctx) => {
  await ctx.reply('Admin menu', { reply_markup: adminMenu });
});

bot.command('cancel', async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply('Cancelled');
});

bot.start({
  onStart: (botInfo) => {
    console.log(botInfo);
    MINIAPP_URL = `https://t.me/${botInfo.username}?startapp`;
  },
});

const app = express();
app.use(express.json());

const api = express.Router();
app.use('/api', api);

api.get('/', (req, res) => {
  res.json({ message: `Hello from API (${Date.now()})` });
});

const productApi = express.Router();
api.use('/products', productApi);

productApi.get('/', (req, res) => {
  res.json({
    products: productList,
  });
});

api.route('/orders').post(async (req, res) => {
  const order: Order = req.body.order;
  order.id = `${Date.now()}`;
  console.dir(order, { depth: null });
  res.json({ message: 'created order', order });
  const formattedCart = order.cart
    .map(
      ({ product, quantity }) =>
        `[${product.id}] (x ${quantity}) ${product.name}  `
    )
    .join('\n');
  const formattedOrder = `<b>ID:</b> ${order.id}<b>\n<b>Phone:</b> ${order.customer.phone}\n<b>Name:</b> ${order.customer.name}\nCart:</b>\n${formattedCart}`;
  try {
    await bot.api.sendMessage(CHANNEL_ID, formattedOrder, {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error(error);
  }
});

const addProduct = async (name: string, price = 1, image = '') => {
  const product: Product = {
    id: `${Date.now()}`,
    name,
    price,
    image,
  };
  productList.push(product);
};

const PORT = process.env.PORT ?? 5000;
try {
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
} catch (error) {
  console.error(error);
}
