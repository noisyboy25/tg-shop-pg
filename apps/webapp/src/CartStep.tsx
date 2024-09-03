import {
  Stack,
  NumberFormatter,
  Text,
  Table,
  TableData,
  Badge,
} from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { MainContext } from './mainContext';

function CartStep() {
  const mainContext = useContext(MainContext);

  const [tableData, setTableData] = useState<TableData>();

  useEffect(() => {
    setTableData({
      body: [
        ...Object.values(mainContext.cart)
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
        [
          '',
          '',
          '',
          <Text key={'price'}>
            <NumberFormatter
              prefix={'$'}
              value={mainContext.cost}
              thousandSeparator
            />
          </Text>,
        ],
      ],
    });
  }, [mainContext.cart, mainContext.cost]);

  return (
    <Stack pl={'sm'} pr={'sm'}>
      <Table
        data={tableData}
        borderColor="var(--tg-theme-section-separator-color)"
      />
    </Stack>
  );
}

export default CartStep;
