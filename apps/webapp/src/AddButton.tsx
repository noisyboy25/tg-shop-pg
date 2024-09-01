import { Button, Group } from '@mantine/core';
import React from 'react';
import { CartView, Product } from './types';
import { IconMinus, IconPlus } from '@tabler/icons-react';

function AddButton({
  product,
  cart,
  setCart,
}: Readonly<{
  product: Product;
  cart: CartView;
  setCart: React.Dispatch<React.SetStateAction<CartView>>;
}>) {
  const productInc = () => {
    setCart((prev) => {
      const prevQuantity = prev[product.id]?.quantity ?? 0;
      return {
        ...prev,
        [product.id]: {
          product: product,
          quantity: prevQuantity + 1,
        },
      };
    });
  };

  const productDec = () => {
    setCart((prev) => {
      const prevQuantity = prev[product.id]?.quantity ?? 0;
      if (prevQuantity <= 0) return prev;
      return {
        ...prev,
        [product.id]: {
          product: product,
          quantity: prevQuantity > 0 ? prevQuantity - 1 : prevQuantity,
        },
      };
    });
  };

  return (
    <>
      {cart[product.id]?.quantity ? (
        <Group gap={0} justify={'space-between'}>
          <Button onClick={productDec} size={'compact-md'}>
            <IconMinus width={'1rem'} />
          </Button>
          <Button onClick={productInc} size={'compact-md'}>
            <IconPlus width={'1rem'} />
          </Button>
        </Group>
      ) : (
        <Button onClick={productInc} size="compact-md">
          Add
        </Button>
      )}
    </>
  );
}

export default AddButton;
