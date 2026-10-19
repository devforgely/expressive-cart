import { createSlice } from '@reduxjs/toolkit';
import { logoutUser } from '../auth/Auth.actions';
import { sessionExpired } from '../auth/Auth.reducers';
import { checkoutCart } from '../cart/Cart.actions';
import { loadOrder, loadOrders } from './Orders.actions';
import type { Address } from '../../utils/address';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  date: string;
  status?: string;
  cardLast4?: string | null;
  cardBrand?: string | null;
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
}

export interface OrderState {
  [orderId: string]: Order;
}

const initialState: OrderState = {}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Add order from successful checkout
      .addCase(checkoutCart.fulfilled, (state, action) => {
        const { order } = action.payload;
        if (order?.id && order.items) {
          state[order.id] = order;
        }
      })
      // Load order data by ID success
      .addCase(loadOrder.fulfilled, (state, action) => {
        const { order } = action.payload;
        state[order.id] = order;
      })
      // Load order list success
      .addCase(loadOrders.fulfilled, (state, action) => {
        const orders = Array.isArray(action.payload.orders) ? action.payload.orders : [];
        Object.keys(state).forEach((orderId) => {
          delete state[orderId];
        });
        orders.forEach((order: Order) => {
          state[order.id] = order;
        });
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.keys(state).forEach((orderId) => {
          delete state[orderId];
        });
      })
      .addCase(sessionExpired, (state) => {
        Object.keys(state).forEach((orderId) => {
          delete state[orderId];
        });
      })
  }
});

// Export reducer function by default
export default orderSlice.reducer;