import { CartView } from './types';

export const calculateCost = (cart: CartView) =>
  Object.values(cart).reduce(
    (acc, { product, quantity }) => acc + product.price * quantity,
    0
  );
