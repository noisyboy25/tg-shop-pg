import { useEffect, useState } from 'react';
import { WebApp } from '@grammyjs/web-app';
import '@mantine/core/styles.css';
import './tg.module.css';
import {
  Button,
  Card,
  Center,
  Image,
  List,
  ListItem,
  Loader,
  MantineProvider,
  NumberFormatter,
  rem,
  ScrollArea,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
} from '@mantine/core';

function App() {
  const [cost, setCost] = useState(0);
  const [products, setProducts] = useState<
    { id: string; name: string; price: number; image: string }[]
  >([]);
  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));

  const [orders, setOrders] = useState<{ id: number; cost: number }[]>([]);

  useEffect(() => {
    console.log(window.Telegram.WebApp.initData);
    WebApp.ready();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/products');
      const { products } = await res.json();
      setProducts(products);
    })();
  }, []);

  const createOrder = async () => {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: { cost } }),
    });
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data.orders);
  };

  return (
    <MantineProvider>
      <Stack h={'100%'} justify={'space-between'}>
        <Stepper
          active={active}
          onStepClick={setActive}
          size="sm"
          styles={{
            root: { height: 'auto' },
            steps: {
              paddingLeft: rem(10),
              paddingRight: rem(10),
              paddingTop: rem(20),
            },
          }}
        >
          <Stepper.Step label={'Catalogue'} description={'Choose goods'}>
            <Stack pl={'sm'} pr={'sm'}>
              <Button onClick={() => nextStep()}>
                <div>
                  Continue{' '}
                  <NumberFormatter
                    prefix={'$'}
                    value={cost}
                    thousandSeparator
                  />
                </div>
              </Button>
            </Stack>
            <ScrollArea>
              <SimpleGrid
                mt={'md'}
                p={'sm'}
                cols={3}
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                }}
              >
                {products.map((product) => (
                  <Card
                    key={product.id}
                    style={{
                      backgroundColor: 'var(--tg-theme-section-bg-color)',
                    }}
                  >
                    <Card.Section>
                      <Image src={product.image} fit="cover" height={'140'} />
                    </Card.Section>
                    <Text m={'auto'} fw={500}>
                      {product.name}
                    </Text>
                    <Text m={'xs'} mt={'auto'}>
                      <NumberFormatter
                        prefix={'$'}
                        value={product.price}
                        thousandSeparator
                      />
                    </Text>
                    <Button
                      onClick={() => {
                        setCost((prev) => prev + product.price);
                        WebApp.HapticFeedback.notificationOccurred('success');
                      }}
                    >
                      Add
                    </Button>
                  </Card>
                ))}
              </SimpleGrid>
            </ScrollArea>
          </Stepper.Step>
          <Stepper.Step label={'Order'} description={'Select payment method'}>
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
                    value={cost}
                    thousandSeparator
                  />
                </div>
              </Button>
            </Stack>
          </Stepper.Step>
          <Stepper.Completed>
            <Stack pl={'sm'} pr={'sm'}>
              <Button>
                <Loader color={'rgba(194, 232, 255, 0.48)'} size={'sm'} />
              </Button>
              <List>
                {orders.map((order) => (
                  <ListItem key={order.id}>{order.cost}</ListItem>
                ))}
              </List>
            </Stack>
          </Stepper.Completed>
        </Stepper>
        <Center bg={'var(--tg-theme-bg-color)'}>
          <Text c={'dimmed'}>API v{WebApp.version}</Text>
        </Center>
      </Stack>
    </MantineProvider>
  );
}

export default App;
