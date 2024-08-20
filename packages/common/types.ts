export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};
export type Order = {
  id: string;
  cart: {
    product: Product;
    quantity: number;
  }[];
  customer: {
    name: string;
    phone: string;
  };
};
