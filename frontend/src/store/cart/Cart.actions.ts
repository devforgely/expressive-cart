import { createAsyncThunk } from '@reduxjs/toolkit';
import { addToCart, checkout, fetchCart, removeFromCart } from '../../apis/cart';
import type { Token } from '@stripe/stripe-js';

interface AddItemParams {
  product: any;
  quantity: number;
}

export const addItem = createAsyncThunk(
  'cart/addItem',
  async ({ product, quantity }: AddItemParams) => {
    const response = await addToCart(product.id, quantity);
    const item = {
      ...product,
      cartItemId: response.id,
      quantity
    };
    return { item };
  }
);

interface OrderParams {
  cartId: string;
  paymentInfo: Token;
}

export const checkoutCart = createAsyncThunk(
  'cart/checkoutCart',
  async ({ cartId, paymentInfo }: OrderParams) => {
    const response = await checkout(cartId, paymentInfo);
    return {
      order: response
    }
  }
);

export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async () => {
    const response = await fetchCart();
    return {
      cart: response
    }
  }
);

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId: string) => {
    await removeFromCart(cartItemId);
    return {
      item: cartItemId
    }
  }
);
