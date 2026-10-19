import API from './client';
import { isAxiosError } from 'axios';

export interface ProductQuery {
  search?: string;
  category?: string;
}

// API interface for loading products
export const fetchProducts = async (params?: ProductQuery) => {
  try {
    const response = await API.get(`products`, { params });

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}

// API interface for loading a product by product ID
export const fetchProduct = async (productId: string) => {
  try {
    const response = await API.get(`products/${productId}`);
    
    return response.data;
  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}