import { calculateCost, Order } from '@tg-shop-pg/common';

export const formatOrder = (order: Order) => {
  const formattedCart = order.cart
    .map(({ product, quantity }) => {
      const { id, name, price, unit } = product;
      const u = unit ? `${unit} ` : '';
      return `[${id}] ${name}
($${price} x ${quantity} ${u}= $${price * quantity})`;
    })
    .join('\n\n');
  return `<b>Cart:</b>
${formattedCart}

<b>ID:</b> ${order.id}
<b>Name:</b> ${order.customer.name}
<b>Phone:</b> ${order.customer.phone}
<b>Cost:</b> $${calculateCost(order.cart)}`;
};
