import { Stack, Button, NumberFormatter } from '@mantine/core';
import { calculateCost } from './util';
import { Cart } from './types';

function OrderStep({
  cart,
  createOrder,
  nextStep,
}: {
  cart: Cart;
  createOrder: () => void;
  nextStep: () => void;
}) {
  return (
    <Stack pl={'sm'} pr={'sm'}>
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
