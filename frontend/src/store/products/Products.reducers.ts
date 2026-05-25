import { createSlice } from '@reduxjs/toolkit';
import { loadProduct, loadProducts } from './Products.actions';

export interface Product {
  id: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export interface ProductState {
  [id: string]: Product; 
}

const initialState: ProductState = {};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Load product data by ID success
      .addCase(loadProduct.fulfilled, (state, action) => {
        const { product } = action.payload;
        state[product.id] = product;
      })
      // Load product list success
      .addCase(loadProducts.fulfilled, (state, action) => {
        const { products } = action.payload;
        products.forEach((product: Product) => {
          const { id } = product;
          state[id] = product;
        });
      })
  }
});

// Export reducer function by default
export default productSlice.reducer;