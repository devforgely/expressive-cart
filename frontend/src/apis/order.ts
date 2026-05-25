import API from './client';
import { isAxiosError } from 'axios';

// API interface for loading a user's orders
export const fetchOrders = async () => {
  try {
    const response = await API.get(`orders`);

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}

// API interface for loading a user's order by order ID
export const fetchOrder = async (orderId: string) => {
  try {
    const response = await API.get(`orders/${orderId}`);

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}