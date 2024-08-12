export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};
export type Cart = {
  [key: string]: { product: Product; quantity: number };
};
