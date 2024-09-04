import db from './db/drizzle';
import { products } from './db/schema';

export const addProduct = async (
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
export const findAllProducts = async () => await db.select().from(products);
