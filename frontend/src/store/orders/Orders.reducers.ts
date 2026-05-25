import { createSlice } from '@reduxjs/toolkit';
import { checkoutCart } from '../cart/Cart.actions';
import { loadOrder, loadOrders } from './Orders.actions';
import type { Product } from '../products/Products.reducers';

export interface Order {
  id: string;
  items: Product[];
  total: number;
  date: string;
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
        state[order.id] = order;
      })
      // Load order data by ID success
      .addCase(loadOrder.fulfilled, (state, action) => {
        const { order } = action.payload;
        state[order.id] = order;
      })
      // Load order list success
      .addCase(loadOrders.fulfilled, (state, action) => {
        const { orders } = action.payload;
        orders.forEach((order: Order) => {
          const { id } = order;
          state[id] = order;
        });
      })
  }
});

// Export reducer function by default
export default orderSlice.reducer;