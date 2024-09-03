import { Product } from '@tg-shop-pg/common';

export type CartView = {
  [key: string]: { product: Product; quantity: number };
};

export type UserFormValues = { name: string; phone: string };
