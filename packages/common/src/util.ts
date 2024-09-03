import { CartItem } from './types';

export const calculateCost = (cart: CartItem[]) =>
  cart.reduce(
    (acc, { product, quantity }) => acc + product.price * quantity,
    0
  );
