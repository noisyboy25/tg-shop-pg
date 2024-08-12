import 'dotenv/config';
import express from 'express';
import { Cart } from './types';

const IMAGE_API = process.env.IMAGE_API;

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

const orders: { id: number; cart: Cart }[] = [];
api
  .route('/orders')
  .get((req, res) => {
    console.dir(orders);
    res.json({ orders });
  })
  .post((req, res) => {
    const { order } = req.body;
    order.id = orders.length;
    console.dir(order, { depth: null });
    orders.push(order);
    res.json({ message: 'created order', order });
  });

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
