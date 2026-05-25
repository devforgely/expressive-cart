import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { checkLoginStatus } from '../auth/Auth.actions';
import { addItem, checkoutCart, loadCart, removeItem } from './Cart.actions';
import type { Product } from '../products/Products.reducers';

export type Item = Product & {
  quantity: number;
};

type CartState = {
  id: string;
  items: Item[];
  cartTotal: number;
};

const initialState: CartState = {
  id: '',
  items: [],
  cartTotal: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemLocal: (state, action: PayloadAction<Item>) => {
      const existing = state.items.find(
        (i) => i.id === action.payload.id
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },

    removeItemLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (i) => i.id === action.payload.id
      );

      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    clearCart: (state) => {
      state.items = [];
    },

    setCartFromServer: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItem.fulfilled, (state, action) => {
        const { item } = action.payload;
        state.items.push(item);
      })
      .addCase(checkLoginStatus.fulfilled, (state, action) => {
        const { cart } = action.payload;
        Object.assign(state, cart);
      })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        const { cart } = action.payload;
        Object.assign(state, cart);
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        const { item } = action.payload;
        state.items = state.items.filter((product) => product.id !== item);
      })
  }
});

export const {
  addItemLocal,
  removeItemLocal,
  updateQuantity,
  clearCart,
  setCartFromServer,
} = cartSlice.actions;

// Export reducer function by default
export default cartSlice.reducer;