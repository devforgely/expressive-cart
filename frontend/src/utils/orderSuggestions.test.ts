import { describe, expect, it } from 'vitest';
import type { Order } from '../store/orders/Orders.reducers';
import type { Product, ProductState } from '../store/products/Products.reducers';
import { buildOrderSuggestions } from './orderSuggestions';

function product(overrides: Partial<Product> & Pick<Product, 'id' | 'name' | 'category'>): Product {
  return {
    description: '',
    details: [],
    price: 10,
    imageUrl: '',
    stock: 5,
    ...overrides
  };
}

const catalog: ProductState = {
  '1': product({ id: '1', name: 'Headphones', category: 'Tech', price: 129.99 }),
  '2': product({ id: '2', name: 'Keyboard', category: 'Tech', price: 79.99 }),
  '3': product({ id: '3', name: 'Crewneck', category: 'Fashion', price: 39.99 }),
  '4': product({ id: '4', name: 'Shirt', category: 'Fashion', price: 54.99 }),
  '5': product({ id: '5', name: 'Skillet', category: 'Home & Kitchen', price: 45.99 })
};

function order(id: string, date: string, items: Order['items']): Order {
  return { id, date, total: 10, items };
}

describe('buildOrderSuggestions', () => {
  it('returns nothing when there is no order history', () => {
    expect(buildOrderSuggestions([], catalog)).toEqual({ buyAgain: [], recommended: [] });
  });

  it('lists purchased products once, newest order first', () => {
    const orders = [
      order('older', '2026-01-01T00:00:00.000Z', [
        { id: 'a', productId: '3', name: 'Crewneck', quantity: 1, price: 39.99 }
      ]),
      order('newer', '2026-03-01T00:00:00.000Z', [
        { id: 'b', productId: '1', name: 'Headphones', quantity: 1, price: 129.99 },
        { id: 'c', productId: '1', name: 'Headphones', quantity: 1, price: 129.99 }
      ])
    ];

    const { buyAgain } = buildOrderSuggestions(orders, catalog);

    expect(buyAgain.map((item) => item.id)).toEqual(['1', '3']);
  });

  it('recommends other products from categories the shopper has ordered', () => {
    const orders = [
      order('1', '2026-02-01T00:00:00.000Z', [
        { id: 'a', productId: '1', name: 'Headphones', quantity: 2, price: 129.99 },
        { id: 'b', productId: '3', name: 'Crewneck', quantity: 1, price: 39.99 }
      ])
    ];

    const { recommended } = buildOrderSuggestions(orders, catalog);

    expect(recommended.map((item) => item.id)).toEqual(['2', '4']);
  });

  it('ignores purchased products that are no longer in the catalog', () => {
    const orders = [
      order('1', '2026-02-01T00:00:00.000Z', [
        { id: 'a', productId: 'missing', name: 'Gone', quantity: 1, price: 10 }
      ])
    ];

    expect(buildOrderSuggestions(orders, catalog)).toEqual({ buyAgain: [], recommended: [] });
  });
});
