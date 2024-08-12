import { useEffect, useState } from 'react';
import { WebApp } from '@grammyjs/web-app';
import '@mantine/core/styles.css';
import './tg.module.css';
import {
  AppShell,
  Button,
  Card,
  Center,
  Image,
  Loader,
  MantineProvider,
  NumberFormatter,
  rem,
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

  return (
    <MantineProvider>
      <AppShell withBorder={false}>
        <AppShell.Main>
          <Stepper
            active={active}
            onStepClick={setActive}
            size="sm"
            styles={{
              steps: {
                paddingLeft: rem(10),
                paddingRight: rem(10),
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
              <SimpleGrid
                mt={'md'}
                p={'sm'}
                cols={3}
                style={{
                  backgroundColor: WebApp.themeParams.secondary_bg_color,
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
            </Stepper.Step>
            <Stepper.Step label={'Order'} description={'Select payment method'}>
              <Button onClick={() => nextStep()}>
                <div>
                  Confirm{' '}
                  <NumberFormatter
                    prefix={'$'}
                    value={cost}
                    thousandSeparator
                  />
                </div>
              </Button>
            </Stepper.Step>
            <Stepper.Completed>
              <Button>
                <Loader color={'rgba(194, 232, 255, 0.48)'} size={'sm'} />
              </Button>
            </Stepper.Completed>
          </Stepper>
        </AppShell.Main>
        <AppShell.Footer>
          <Center bg={'var(--tg-theme-bg-color)'}>
            <Text c={'dimmed'}>API v{WebApp.version}</Text>
          </Center>
        </AppShell.Footer>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
