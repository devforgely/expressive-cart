export const FREE_SHIPPING_MINIMUM = 30;
export const STANDARD_SHIPPING_FEE = 5.99;

export const money = (amount: number) => `$${Number(amount || 0).toFixed(2)}`;

export function shippingQuote(subtotal: number) {
  const amount = Math.max(0, Number(subtotal) || 0);
  const shipping = amount > 0 && amount < FREE_SHIPPING_MINIMUM ? STANDARD_SHIPPING_FEE : 0;

  return {
    shipping,
    total: amount + shipping,
    remaining: shipping > 0 ? FREE_SHIPPING_MINIMUM - amount : 0
  };
}
