import { Product } from '@tg-shop-pg/common';

export type Cart = {
  [key: string]: { product: Product; quantity: number };
};
