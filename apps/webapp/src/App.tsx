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
  InputBase,
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
import { CartView } from './types';
import { IconHeart } from '@tabler/icons-react';
import AddButton from './AddButton';
import { useForm } from '@mantine/form';
import { IMaskInput } from 'react-imask';
import { Order, Product } from '@tg-shop-pg/common';

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = useCallback(
    () => setActive((current) => (current > 0 ? current - 1 : current)),
    [setActive]
  );

  const [cart, setCart] = useState<CartView>({});

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

    WebApp.BackButton.isVisible = active > 0 && active < 3;
  }, [active]);

  const footer = useRef<HTMLElement>(null);

  const createOrder = async () => {
    if (cost <= 0) return;
    setOrderLoading(true);
    const filteredCart = Object.values(cart).filter(({ quantity }) => quantity);
    const formattedOrder: Order = {
      id: '',
      cart: filteredCart,
      customer: form.getTransformedValues(),
    };
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: formattedOrder,
      }),
    });
    setCart({});
    setOrderLoading(false);
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  const form = useForm({
    initialValues: { name: '', phone: '+7' },
    validate: {
      name: (value) =>
        value.length > 2 && value.length <= 20 ? null : 'Invalid name',
      phone: (value) =>
        /^\+\d \(\d{3}\) \d{3}-\d{4}$/.test(value)
          ? null
          : 'Invalid phone number',
    },
    transformValues: (values) => ({
      name: values.name.trim(),
      phone: values.phone.trim().replace(/[^+\d]/g, ''),
    }),
  });

  const submitRef = useRef<HTMLButtonElement>(null);

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
          {active === 1 && <OrderStep cart={cart} nextStep={nextStep} />}
          {active === 2 && (
            <Container>
              <form
                onSubmit={form.onSubmit(() => {
                  createOrder();
                  nextStep();
                })}
              >
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
                <InputBase
                  component={IMaskInput}
                  label="Phone number"
                  key={form.key('phone')}
                  mask={'+7 (000) 000-0000'}
                  {...form.getInputProps('phone')}
                  styles={{
                    input: {
                      background: WebApp.themeParams.secondary_bg_color,
                      color: WebApp.themeParams.text_color,
                    },
                  }}
                  withAsterisk
                />

                <button type="submit" ref={submitRef} hidden />
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
                  console.log(submitRef.current);
                  submitRef.current?.click();
                }}
                disabled={cost <= 0}
              >
                <Box>
                  Confirm{' '}
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
