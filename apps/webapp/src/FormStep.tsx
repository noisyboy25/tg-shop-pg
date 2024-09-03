import { WebApp } from '@grammyjs/web-app';
import { Container, TextInput, InputBase } from '@mantine/core';
import { useContext, useRef } from 'react';
import { IMaskInput } from 'react-imask';
import { MainContext } from './App';
import { Order } from '@tg-shop-pg/common';
import { UserFormValues } from './types';
import { UseFormReturnType } from '@mantine/form';

function FormStep({
  form,
  submitRef,
}: Readonly<{
  form: UseFormReturnType<
    UserFormValues,
    (values: UserFormValues) => UserFormValues
  >;
  submitRef: React.RefObject<HTMLButtonElement>;
}>) {
  const mainContext = useContext(MainContext);

  const submitRef = useRef<HTMLButtonElement>(null);

  const createOrder = async () => {
    if (mainContext.cost <= 0) return;
    const filteredCart = Object.values(mainContext.cart).filter(
      ({ quantity }) => quantity
    );
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
    mainContext.setCart({});
    WebApp.HapticFeedback.notificationOccurred('success');
  };

  return (
    <Container>
      <form
        onSubmit={form.onSubmit(() => {
          createOrder();
          mainContext.nextStep();
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
          inputMode="tel"
        />

        <button type="submit" ref={submitRef} hidden />
      </form>
    </Container>
  );
}

export default FormStep;
