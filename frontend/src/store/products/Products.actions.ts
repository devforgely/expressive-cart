import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProduct, fetchProducts } from '../../apis/product';

export const loadProduct = createAsyncThunk(
  'products/loadProduct',
  async (productId: string) => {
    const response = await fetchProduct(productId);
    return {
      product: response
    };
  }
);

export const loadProducts = createAsyncThunk(
  'products/loadProducts',
  async () => {
    const response = await fetchProducts();
    return {
      products: response
    }
  }
);