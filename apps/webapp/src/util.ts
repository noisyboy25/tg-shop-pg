import { Cart } from './types';

export const calculateCost = (cart: Cart) =>
  Object.values(cart).reduce(
    (acc, { product, quantity }) => acc + product.price * quantity,
    0
  );
