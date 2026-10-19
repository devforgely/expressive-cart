import { createAsyncThunk } from '@reduxjs/toolkit';
import { addToCart, checkout, fetchCart, removeFromCart, updateCartItem } from '../../apis/cart';
import type { Token } from '@stripe/stripe-js';
import type { Address } from '../../utils/address';

const errorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'string' && err) {
    return err;
  }
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' && err.message) {
    return err.message;
  }
  return fallback;
};

interface AddItemParams {
  productId: string;
  quantity: number;
}

export const addItem = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity }: AddItemParams, { rejectWithValue }) => {
    try {
      const cart = await addToCart(productId, quantity);
      return { cart };
    } catch (err) {
      return rejectWithValue(errorMessage(err, 'Unable to add this item to your cart'));
    }
  }
);

interface UpdateItemParams {
  cartItemId: string;
  quantity: number;
}

export const updateItem = createAsyncThunk(
  'cart/updateItem',
  async ({ cartItemId, quantity }: UpdateItemParams, { rejectWithValue }) => {
    try {
      const cart = await updateCartItem(cartItemId, quantity);
      return { cart };
    } catch (err) {
      return rejectWithValue(errorMessage(err, 'Unable to update your cart'));
    }
  }
);

interface OrderParams {
  cartId: string;
  paymentInfo: Token;
  shippingAddress: Address;
  billingAddress: Address;
}

export const checkoutCart = createAsyncThunk(
  'cart/checkoutCart',
  async ({ cartId, paymentInfo, shippingAddress, billingAddress }: OrderParams, { rejectWithValue }) => {
    try {
      const response = await checkout(cartId, paymentInfo, { shippingAddress, billingAddress });
      return {
        order: response
      };
    } catch (err) {
      return rejectWithValue(errorMessage(err, 'Unable to place your order'));
    }
  }
);

export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await fetchCart();
      return { cart };
    } catch (err) {
      return rejectWithValue(errorMessage(err, 'Unable to load your cart'));
    }
  }
);

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId: string, { rejectWithValue }) => {
    try {
      const cart = await removeFromCart(cartItemId);
      return { cart };
    } catch (err) {
      return rejectWithValue(errorMessage(err, 'Unable to remove this item'));
    }
  }
);
