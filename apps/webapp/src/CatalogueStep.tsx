import {
  Box,
  Card,
  Image,
  Text,
  NumberFormatter,
  SimpleGrid,
} from '@mantine/core';
import AddButton from './AddButton';
import { useContext } from 'react';
import { MainContext } from './App';

function CatalogueStep() {
  const mainContext = useContext(MainContext);
  return (
    <SimpleGrid p={'xs'} cols={2}>
      {mainContext.products.map((product) => (
        <Card
          key={product.id}
          p={'xs'}
          styles={{
            root: {
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            },
          }}
        >
          <Card.Section>
            <Image src={product.image} fit="cover" height={200} />
          </Card.Section>
          <Text mt={'xs'} fw={500}>
            {product.name}
          </Text>

          <Box mt={'auto'} mb={'xs'}>
            <NumberFormatter
              prefix={'$'}
              value={product.price}
              thousandSeparator
            />
          </Box>
          <AddButton
            product={product}
            cart={mainContext.cart}
            setCart={mainContext.setCart}
          />
        </Card>
      ))}
    </SimpleGrid>
  );
}

export default CatalogueStep;
