import type { Order } from '../store/orders/Orders.reducers';
import type { Product, ProductState } from '../store/products/Products.reducers';

const RECOMMENDATION_LIMIT = 12;

function orderTime(order: Order) {
  const time = Date.parse(order.date);
  return Number.isNaN(time) ? 0 : time;
}

export function buildOrderSuggestions(orders: Order[], catalog: ProductState) {
  const recentOrders = [...orders].sort((a, b) => orderTime(b) - orderTime(a));
  const purchasedIds = new Set<string>();
  const buyAgain: Product[] = [];
  const categoryWeight = new Map<string, number>();

  for (const order of recentOrders) {
    for (const item of order.items || []) {
      const product = item.productId ? catalog[item.productId] : undefined;
      if (!product) continue;

      if (!purchasedIds.has(product.id)) {
        purchasedIds.add(product.id);
        buyAgain.push(product);
      }

      if (product.category) {
        const quantity = Number(item.quantity) || 1;
        categoryWeight.set(product.category, (categoryWeight.get(product.category) || 0) + quantity);
      }
    }
  }

  const recommended = Object.values(catalog)
    .filter((product) => product.category && categoryWeight.has(product.category) && !purchasedIds.has(product.id))
    .sort((a, b) => {
      const weightDiff = (categoryWeight.get(b.category) || 0) - (categoryWeight.get(a.category) || 0);
      if (weightDiff !== 0) return weightDiff;
      return a.name.localeCompare(b.name);
    })
    .slice(0, RECOMMENDATION_LIMIT);

  return { buyAgain, recommended };
}
