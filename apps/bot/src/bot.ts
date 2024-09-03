import dotenvx from '@dotenvx/dotenvx';
dotenvx.config();
import { Bot, Context, InlineKeyboard, session } from 'grammy';
import express from 'express';
import { calculateCost, Order } from '@tg-shop-pg/common';
import { Menu } from '@grammyjs/menu';
import {
  Conversation,
  createConversation,
  ConversationFlavor,
  conversations,
} from '@grammyjs/conversations';
import axios from 'axios';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { products } from './db/schema';
import path from 'path';
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);
(async () => {
  const result = await db.select().from(products);
  console.log(result);
})();

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
  const name = await conversation.form.text();
  await ctx.reply('Unit measure:');
  const unit = await conversation.form.text();
  await ctx.reply('Min package:');
  const minPackage = await conversation.form.number();
  await ctx.reply('Product price:');
  const price = await conversation.form.number();
  await ctx.reply('Product image:');
  const { file_path: imagePath } = await (
    await conversation.waitFor('message:media')
  ).getFile();
  console.log(imagePath);
  if (!imagePath) return;

  await addProduct(name, price, `/api/images/${imagePath}`, minPackage, unit);
  await ctx.reply(`Product added: ${name}`);
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

app.use(express.static(path.resolve('../webapp/dist')));

const api = express.Router();
app.use('/api', api);

api.get('/', (req, res) => {
  res.json({ message: `Hello from API (${Date.now()})` });
});

api.get('/images/photos/:imagePath', async (req, res) => {
  const { imagePath } = req.params;
  try {
    const imgRes = await axios.get(
      `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/photos/${imagePath}`,
      { responseType: 'stream' }
    );
    imgRes.data.pipe(res);
  } catch (error) {
    console.log(error);
  }
});

const productApi = express.Router();
api.use('/products', productApi);

productApi.get('/', async (req, res) => {
  res.json({
    products: await db.select().from(products),
  });
});

api.route('/orders').post(async (req, res) => {
  const order: Order = req.body.order;
  order.id = `${Date.now()}`;
  console.dir(order, { depth: null });
  res.json({ message: 'created order', order });

  const formattedCart = order.cart
    .map(({ product, quantity }) => {
      const { id, name, price, unit } = product;
      const u = unit ? `${unit} ` : '';
      return `[${id}]  ${name}
($${price} x ${quantity} ${u}= $${price * quantity})`;
    })
    .join('\n\n');

  const formattedOrder = `<b>Cart:</b>
${formattedCart}

<b>ID:</b> ${order.id}
<b>Name:</b> ${order.customer.name}
<b>Phone:</b> ${order.customer.phone}
<b>Cost:</b> $${calculateCost(order.cart)}
`;

  try {
    await bot.api.sendMessage(CHANNEL_ID, formattedOrder, {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error(error);
  }
});

const addProduct = async (
  name: string,
  price = 1,
  image = '',
  minPackage = 1,
  unit?: string
) => {
  await db.insert(products).values({
    name,
    price,
    image,
    minPackage,
    unit,
  });
};

const PORT = process.env.PORT ?? 5000;
try {
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
} catch (error) {
  console.error(error);
}
