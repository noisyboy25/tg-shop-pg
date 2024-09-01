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
import fs from 'fs';
import path from 'path';
import { calculateCost } from '@tg-shop-pg/common/util';

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

const IMAGES_DIR_NAME = 'product-images';
const IMAGES_DIR = path.resolve(`../webapp/public/${IMAGES_DIR_NAME}`);

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
  const name = await conversation.form.text();
  await ctx.reply('Product price:');
  const price = await conversation.form.number();
  await ctx.reply('Product image:');
  const { file_path: imagePath, file_unique_id: imageId } = await (
    await conversation.waitFor('message:media')
  ).getFile();
  console.log(imagePath);
  if (!imagePath) return;
  const res = await fetch(
    `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${imagePath}`
  );
  if (!res.ok) return;
  const imageName = `${imageId}.jpg`;
  const imageFilePath = path.resolve(IMAGES_DIR, imageName);
  try {
    if (!fs.existsSync(IMAGES_DIR))
      await fs.promises.mkdir(IMAGES_DIR, { recursive: true });
    const fileStream = fs.createWriteStream(imageFilePath);
    const stream = new WritableStream<Uint8Array>({
      write(chunk) {
        fileStream.write(chunk);
      },
    });
    if (!res.body) return;
    await res.body.pipeTo(stream);
  } catch (error) {
    console.log(error);
  }
  await addProduct(name, price, `/${IMAGES_DIR_NAME}/${imageName}`);
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
    .map(({ product, quantity }) => {
      const { id, name, price } = product;
      return `[${id}]  ${name}\n($${price} x ${quantity} = $${
        price * quantity
      })`;
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

const addProduct = async (name: string, price = 1, image = '') => {
  const product: Product = {
    id: `${Date.now()}`,
    name,
    price,
    image,
  };
  productList.unshift(product);
};

const PORT = process.env.PORT ?? 5000;
try {
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
} catch (error) {
  console.error(error);
}
