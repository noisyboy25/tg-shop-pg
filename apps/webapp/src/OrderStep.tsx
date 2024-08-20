import {
  Stack,
  NumberFormatter,
  Text,
  Table,
  TableData,
  Badge,
} from '@mantine/core';
import { Cart } from './types';
import { useEffect, useState } from 'react';

function OrderStep({
  cart,
}: Readonly<{
  cart: Cart;
  nextStep: () => void;
}>) {
  const [tableData, setTableData] = useState<TableData>();

  useEffect(() => {
    setTableData({
      body: Object.values(cart)
        .filter(({ quantity }) => quantity)
        .map(({ product, quantity }) => [
          product.name,
          <Text key={'price'}>
            <NumberFormatter
              prefix={'$'}
              value={product.price}
              thousandSeparator
            />
          </Text>,
          <Badge key={'quantity'}>x {quantity}</Badge>,
          <Text key={'cost'}>
            <NumberFormatter
              prefix={'$'}
              value={product.price * quantity}
              thousandSeparator
            />
          </Text>,
        ]),
    });
  }, [cart]);

  return (
    <Stack pl={'sm'} pr={'sm'}>
      <Table
        data={tableData}
        borderColor="var(--tg-theme-section-separator-color)"
      />
    </Stack>
  );
}

export default OrderStep;
