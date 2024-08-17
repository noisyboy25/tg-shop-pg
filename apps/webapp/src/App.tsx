import { useCallback, useEffect, useRef, useState } from 'react';
import { WebApp } from '@grammyjs/web-app';
import '@mantine/core/styles.css';
import './tg.module.css';
import {
  Alert,
  AppShell,
  Badge,
  Box,
  Button,
  Card,
  Image,
  Loader,
  MantineProvider,
  NumberFormatter,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import OrderStep from './OrderStep';
import { calculateCost } from './util';
import { Cart, Product } from './types';
import { IconHeart } from '@tabler/icons-react';
import AddButton from './AddButton';

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = useCallback(
    () => setActive((current) => (current > 0 ? current - 1 : current)),
    [setActive]
  );

  const [cart, setCart] = useState<Cart>({});

  const [cost, setCost] = useState(0);
  useEffect(() => {
    setCost(calculateCost(cart));
  }, [cart]);

  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/products');
      const { products } = await res.json();
      setProducts(products);
    })();
    console.log(window.Telegram.WebApp.initData);
    WebApp.ready();
  }, []);

  useEffect(() => {
    WebApp.BackButton.onClick(prevStep);
    return () => {
      WebApp.BackButton.offClick(prevStep);
    };
  }, [prevStep]);

  useEffect(() => {
    console.log(cart);
  }, [cart]);

  useEffect(() => {
    console.log(active);

    WebApp.BackButton.isVisible = active !== 0;
  }, [active]);

  const footer = useRef<HTMLElement>(null);

  const createOrder = async () => {
    if (cost <= 0) return;
    setOrderLoading(true);
    const filteredCart = Object.values(cart).filter(({ quantity }) => quantity);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: { cart: filteredCart } }),
    });
    setCart({});
    setOrderLoading(false);
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  return (
    <MantineProvider>
      <AppShell withBorder={false} footer={{ height: 52 }}>
        <AppShell.Main>
          {active === 0 && (
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
                  p={'sm'}
                  styles={{
                    root: {
                      backgroundColor: 'var(--tg-theme-section-bg-color)',
                    },
                  }}
                >
                  <Card.Section>
                    {cart[product.id]?.quantity ? (
                      <Badge pos={'absolute'} right={'0.5rem'} top={'0.5rem'}>
                        {cart[product.id]?.quantity}
                      </Badge>
                    ) : null}
                    <Image src={product.image} fit="cover" height={'140'} />
                  </Card.Section>
                  <Text mt={'xs'} fw={500}>
                    {product.name}{' '}
                  </Text>

                  <Box mt={'auto'} mb={'xs'}>
                    <NumberFormatter
                      prefix={'$'}
                      value={product.price}
                      thousandSeparator
                    />
                  </Box>
                  <AddButton product={product} cart={cart} setCart={setCart} />
                </Card>
              ))}
            </SimpleGrid>
          )}
          {active === 1 && (
            <OrderStep
              cart={cart}
              createOrder={createOrder}
              nextStep={nextStep}
            />
          )}
          {active === 2 && (
            <Stack pl={'sm'} pr={'sm'}>
              {!orderLoading && (
                <Alert
                  title={'Thank you!'}
                  styles={{
                    message: { color: 'var(--tg-theme-text-color)' },
                  }}
                  icon={<IconHeart />}
                >
                  Your order has been created successfully
                </Alert>
              )}
            </Stack>
          )}
        </AppShell.Main>
        <AppShell.Footer p={'sm'} ref={footer}>
          <Stack>
            {active === 0 && (
              <Button onClick={() => nextStep()} disabled={cost <= 0}>
                <Box>
                  Continue{' '}
                  <NumberFormatter
                    prefix={'$'}
                    value={cost}
                    thousandSeparator
                  />
                </Box>
              </Button>
            )}
            {active === 1 && (
              <Button
                onClick={() => {
                  createOrder();
                  nextStep();
                }}
                disabled={cost <= 0}
              >
                <Box>
                  Pay{' '}
                  <NumberFormatter
                    prefix={'$'}
                    value={cost}
                    thousandSeparator
                  />
                </Box>
              </Button>
            )}
            {active === 2 && orderLoading && (
              <Button>
                <Loader color={'rgba(194, 232, 255, 0.48)'} size={'sm'} />
              </Button>
            )}
          </Stack>
        </AppShell.Footer>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
