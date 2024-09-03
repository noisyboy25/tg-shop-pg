import {
  Button,
  Grid,
  Group,
  NumberInput,
  NumberInputHandlers,
} from '@mantine/core';
import React, { useRef } from 'react';
import { CartView } from './types';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Product } from '@tg-shop-pg/common';
import { WebApp } from '@grammyjs/web-app';

function AddButton({
  product,
  cart,
  setCart,
}: Readonly<{
  product: Product;
  cart: CartView;
  setCart: React.Dispatch<React.SetStateAction<CartView>>;
}>) {
  const handlersRef = useRef<NumberInputHandlers>(null);

  const productInc = () => {
    handlersRef.current?.increment();
  };

  const productDec = () => {
    handlersRef.current?.decrement();
  };

  const productSetQuantity = (product: Product, quantity: number) => {
    setCart((prev) => {
      return {
        ...prev,
        [product.id]: {
          product,
          quantity,
        },
      };
    });
  };

  return (
    <Grid gutter={'xs'} grow>
      <Grid.Col span={1}>
        <NumberInput
          value={cart[product.id]?.quantity || 0}
          disabled={!cart[product.id]?.quantity}
          hideControls
          styles={{
            input: {
              background: WebApp.themeParams.secondary_bg_color,
              color: WebApp.themeParams.text_color,
            },
          }}
          onChange={(value) => productSetQuantity(product, Number(value))}
          handlersRef={handlersRef}
          step={1}
          defaultValue={1}
        />
      </Grid.Col>
      <Grid.Col span={1}>
        {cart[product.id]?.quantity ? (
          <Group gap={'xs'} w={'100%'}>
            <Button onClick={productDec} size={'sm'} p={'3'} flex={'1 1'}>
              <IconMinus />
            </Button>
            <Button onClick={productInc} size={'sm'} p={'3'} flex={'1 1'}>
              <IconPlus />
            </Button>
          </Group>
        ) : (
          <Button onClick={() => productSetQuantity(product, 1)} size="sm">
            Add
          </Button>
        )}
      </Grid.Col>
    </Grid>
  );
}

export default AddButton;
