import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logoutUser } from '../auth/Auth.actions';
import { sessionExpired } from '../auth/Auth.reducers';
import { addItem, checkoutCart, loadCart, removeItem, updateItem } from './Cart.actions';
import type { Product } from '../products/Products.reducers';

export type Item = Product & {
  quantity: number;
  cartItemId: string;
};

type CartState = {
  id: string;
  items: Item[];
  cartTotal: number;
  updating: boolean;
  notice: string | null;
  error: string | null;
};

type ServerCart = {
  id?: string;
  items?: Item[];
  cartTotal?: number;
};

const initialState: CartState = {
  id: '',
  items: [],
  cartTotal: 0,
  updating: false,
  notice: null,
  error: null
};

function rejectMessage(payload: unknown, fallback: string) {
  const message = typeof payload === 'string' ? payload : fallback;
  return message === 'Authentication required' ? null : message;
}

function applyCart(state: CartState, cart?: ServerCart | null) {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  state.id = String(cart?.id ?? '');
  state.items = items;
  state.cartTotal = Number(cart?.cartTotal) || items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  state.updating = false;
}

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
      state.cartTotal = 0;
    },

    setCartFromServer: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },

    clearFeedback: (state) => {
      state.notice = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItem.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        applyCart(state, action.payload.cart);
        state.notice = 'Saved to your cart';
        state.error = null;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.updating = false;
        state.notice = null;
        state.error = rejectMessage(action.payload, 'Unable to add this item to your cart');
      })
      .addCase(updateItem.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        applyCart(state, action.payload.cart);
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.updating = false;
        state.error = rejectMessage(action.payload, 'Unable to update your cart');
      })
      .addCase(checkoutCart.fulfilled, (state) => {
        state.items = [];
        state.cartTotal = 0;
        state.updating = false;
        state.notice = null;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        applyCart(state, action.payload.cart);
      })
      .addCase(loadCart.rejected, (state) => {
        state.updating = false;
      })
      .addCase(removeItem.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        applyCart(state, action.payload.cart);
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.updating = false;
        state.error = rejectMessage(action.payload, 'Unable to remove this item');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.id = '';
        state.items = [];
        state.cartTotal = 0;
        state.updating = false;
        state.notice = null;
        state.error = null;
      })
      .addCase(sessionExpired, (state) => {
        state.id = '';
        state.items = [];
        state.cartTotal = 0;
        state.updating = false;
        state.notice = null;
        state.error = null;
      })
  }
});

export const {
  addItemLocal,
  removeItemLocal,
  updateQuantity,
  clearCart,
  setCartFromServer,
  clearFeedback
} = cartSlice.actions;

// Export reducer function by default
export default cartSlice.reducer;
