import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { MainContext } from './mainContext';

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

  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/products');
      const { products } = await res.json();
      setProducts(products);
      console.log(products);

      console.log(window.Telegram.WebApp.initData);
      WebApp.ready();
    })();
  }, []);

  useEffect(() => {
    const handleContinue = () => {
      if (step === 2 && submitRef.current) return submitRef.current.click();
      nextStep();
    };

    WebApp.BackButton.onClick(prevStep);
    WebApp.MainButton.onClick(handleContinue);
    return () => {
      WebApp.BackButton.offClick(prevStep);
      WebApp.MainButton.offClick(handleContinue);
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
        {step === 2 && <FormStep form={form} submitRef={submitRef} />}
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
