import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { WebApp } from '@grammyjs/web-app';
import '@mantine/core/styles.css';
import './assets/tg.css';
import { Alert, MantineProvider, Stack } from '@mantine/core';
import CartStep from './CartStep';
import { calculateCost } from './util';
import { CartView, UserFormValues } from './types';
import { IconHeart } from '@tabler/icons-react';
import { Product } from '@tg-shop-pg/common';
import CatalogueStep from './CatalogueStep';
import FormStep from './FormStep';
import { useForm } from '@mantine/form';

export const MainContext = createContext<{
  cart: CartView;
  setCart: React.Dispatch<React.SetStateAction<CartView>>;
  products: Product[];
  cost: number;
  step: number;
  nextStep: () => void;
}>({
  cart: {},
  setCart: () => {},
  products: [],
  cost: 0,
  step: 0,
  nextStep: () => {},
});

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  const [step, setStep] = useState(0);
  const nextStep = useCallback(
    () => setStep((current) => (current < 3 ? current + 1 : current)),
    [setStep]
  );
  const prevStep = useCallback(
    () => setStep((current) => (current > 0 ? current - 1 : current)),
    [setStep]
  );

  const [cart, setCart] = useState<CartView>({});

  const cost = useMemo(() => calculateCost(cart), [cart]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/products');
      const { products } = await res.json();
      setProducts(products);
      console.log(window.Telegram.WebApp.initData);
      WebApp.ready();
    })();
  }, []);

  useEffect(() => {
    WebApp.BackButton.onClick(prevStep);
    WebApp.MainButton.onClick(nextStep);
    return () => {
      WebApp.BackButton.offClick(prevStep);
      WebApp.MainButton.offClick(nextStep);
    };
  }, [prevStep, nextStep, step]);

  useEffect(() => {
    console.log(step);
    WebApp.BackButton.isVisible = step > 0 && step < 3;
  }, [step]);

  const form = useForm<UserFormValues>({
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

  useEffect(() => {
    WebApp.MainButton.isVisible = step !== 2 ? cost > 0 : form.isValid();
    WebApp.MainButton.setText(
      `CONTINUE $${new Intl.NumberFormat('en-IN', { currency: 'USD' }).format(
        cost
      )}`
    );
  }, [cost, form, step]);

  const mainContextValue = useMemo(
    () => ({ cart, setCart, products, cost, step, nextStep }),
    [cart, cost, nextStep, products, step]
  );

  return (
    <MantineProvider>
      <MainContext.Provider value={mainContextValue}>
        {step === 0 && <CatalogueStep />}
        {step === 1 && <CartStep />}
        {step === 2 && <FormStep form={form} />}
        {step === 3 && (
          <Stack pl={'sm'} pr={'sm'}>
            <Alert
              title={'Thank you!'}
              styles={{
                message: { color: 'var(--tg-theme-text-color)' },
              }}
              icon={<IconHeart />}
            >
              Your order has been created successfully
            </Alert>
          </Stack>
        )}
      </MainContext.Provider>
    </MantineProvider>
  );
}

export default App;
