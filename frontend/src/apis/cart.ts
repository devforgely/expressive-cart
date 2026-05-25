import API from './client';
import { isAxiosError } from 'axios';

// API interface for loading the user's cart
export const fetchCart = async () => {
  try {
    const response = await API.get(`carts/`);

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}

// API interface for adding a product to a user's cart
export const addToCart = async (productId: string, qty: number) => {
  try {
    const response = await API.post(`carts/items`, { productId, qty });

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}

// API interface for removing a product from a user's cart
export const removeFromCart = async (cartItemId: string) => {
  try {
    const response = await API.delete(`carts/items/${cartItemId}`);

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}

// API interface for checking out a user's cart
export const checkout = async (cartId: string, paymentInfo: any) => {
  try {
    const response = await API.post(`carts/checkout`, { cartId, paymentInfo });

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}