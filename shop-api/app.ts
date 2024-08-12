import 'dotenv/config';
import express from 'express';

const app = express();

const api = express.Router();
app.use('/api', api);

api.get('/', (req, res) => {
  res.json({ message: `Hello from API (${Date.now()})` });
});

const products = express.Router();
api.use('/products', products);

const getImage = async () => {
  const res = await fetch(
    'https://api.waifu.im/search?included_tags=raiden-shogun&is_nsfw=false'
  );
  const { images } = await res.json();
  const image = images[0];
  console.log(image);
  return image;
};

const productList: {
  id: string;
  name: string;
  price: number;
  image: string;
}[] = [];
const generateProducts = async () => {
  for (let i = 0; i < Math.floor(5 + Math.random() * 25); i++) {
    const image = await getImage();
    productList.push({
      id: String(image.image_id),
      name: image.tags[0].name,
      price: image.image_id,
      image: image.url,
    });
  }
};
generateProducts();

products.get('/', (req, res) => {
  res.json({
    products: productList,
  });
});

products.get('/image', async (req, res) => {});

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
