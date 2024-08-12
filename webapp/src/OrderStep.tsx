import {
  Stack,
  Button,
  NumberFormatter,
  Text,
  Table,
  TableData,
} from '@mantine/core';
import { calculateCost } from './util';
import { Cart } from './types';
import { useEffect, useState } from 'react';

function OrderStep({
  cart,
  createOrder,
  nextStep,
}: {
  cart: Cart;
  createOrder: () => void;
  nextStep: () => void;
}) {
  const [tableData, setTableData] = useState<TableData>();

  useEffect(() => {
    setTableData({
      body: Object.values(cart).map(({ product, quantity }) => [
        product.id,
        product.name,
        <Text>
          <NumberFormatter
            prefix={'$'}
            value={product.price}
            thousandSeparator
          />
          <div>x {quantity}</div>
        </Text>,
        <Text>
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
      <Button
        onClick={() => {
          createOrder();
          nextStep();
        }}
      >
        <div>
          Pay{' '}
          <NumberFormatter
            prefix={'$'}
            value={calculateCost(cart)}
            thousandSeparator
          />
        </div>
      </Button>
    </Stack>
  );
}

export default OrderStep;
