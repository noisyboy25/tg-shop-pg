import { Product } from '@tg-shop-pg/common';
import { createContext } from 'react';
import { CartView } from './types';

export const MainContext = createContext<{
  cart: CartView;
  setCart: React.Dispatch<React.SetStateAction<CartView>>;
  products: Product[];
  cost: number;
  step: number;
  nextStep: () => void;
}>({
  cart: {},
  setCart: () => {},
  products: [],
  cost: 0,
  step: 0,
  nextStep: () => {},
});
