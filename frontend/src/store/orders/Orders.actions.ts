import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrder, fetchOrders } from '../../apis/order';

export const loadOrder = createAsyncThunk(
  'orders/loadOrder',
  async (orderId: string) => {
    const response = await fetchOrder(orderId);
    return {
      order: response
    };
  }
);

export const loadOrders = createAsyncThunk(
  'orders/loadOrders',
  async () => {
    const response = await fetchOrders();
    return {
      orders: response
    }
  }
);