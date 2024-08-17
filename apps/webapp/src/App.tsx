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
  Container,
  Image,
  Loader,
  MantineProvider,
  NumberFormatter,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import OrderStep from './OrderStep';
import { calculateCost } from './util';
import { Cart, Product } from './types';
import { IconHeart } from '@tabler/icons-react';
import AddButton from './AddButton';
import { useForm } from '@mantine/form';

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
      body: JSON.stringify({
        order: { cart: filteredCart, customer: form.getValues() },
      }),
    });
    setCart({});
    setOrderLoading(false);
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  const form = useForm();

  return (
    <MantineProvider>
      <AppShell withBorder={false} footer={{ height: cost > 0 ? 86 : 0 }}>
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
            <Container>
              <form>
                <TextInput
                  withAsterisk
                  label="Name"
                  key={form.key('name')}
                  {...form.getInputProps('name')}
                  styles={{
                    input: {
                      background: WebApp.themeParams.secondary_bg_color,
                      color: WebApp.themeParams.text_color,
                    },
                  }}
                />
                <TextInput
                  withAsterisk
                  label="Phone number"
                  key={form.key('phone')}
                  {...form.getInputProps('phone')}
                  styles={{
                    input: {
                      background: WebApp.themeParams.secondary_bg_color,
                      color: WebApp.themeParams.text_color,
                    },
                  }}
                />
              </form>
            </Container>
          )}
          {active === 3 && (
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
        <AppShell.Footer ref={footer}>
          <Stack>
            {(active === 0 || active === 1) && cost > 0 && (
              <Button size="xl" onClick={() => nextStep()} disabled={cost <= 0}>
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
            {active === 2 && (
              <Button
                size="xl"
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
            {active === 3 && orderLoading && (
              <Button size="xl">
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
