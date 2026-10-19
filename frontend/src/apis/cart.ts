import API from './client';
import { isAxiosError } from 'axios';
import type { Address } from '../utils/address';

function rethrow(err: unknown): never {
  if (isAxiosError(err) && err.response) throw err.response.data;
  throw err;
}

// API interface for loading the user's cart
export const fetchCart = async () => {
  try {
    const response = await API.get('cart/');
    return response.data;
  } catch (err) {
    rethrow(err);
  }
}

// API interface for adding a product to a user's cart
export const addToCart = async (productId: string, qty: number) => {
  try {
    const response = await API.post('cart/items', { productId, qty });
    return response.data;
  } catch (err) {
    rethrow(err);
  }
}

// API interface for changing a cart line quantity
export const updateCartItem = async (cartItemId: string, quantity: number) => {
  try {
    const response = await API.put(`cart/items/${cartItemId}`, { quantity });
    return response.data;
  } catch (err) {
    rethrow(err);
  }
}

// API interface for removing a product from a user's cart
export const removeFromCart = async (cartItemId: string) => {
  try {
    const response = await API.delete(`cart/items/${cartItemId}`);
    return response.data;
  } catch (err) {
    rethrow(err);
  }
}

// API interface for checking out a user's cart
export const checkout = async (
  cartId: string,
  paymentInfo: unknown,
  addresses: { shippingAddress: Address; billingAddress: Address }
) => {
  try {
    const response = await API.post('cart/checkout', { cartId, paymentInfo, ...addresses });
    return response.data;
  } catch (err) {
    rethrow(err);
  }
}
