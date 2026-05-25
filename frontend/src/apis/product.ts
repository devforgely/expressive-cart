import API from './client';
import { isAxiosError } from 'axios';

// API interface for loading products
export const fetchProducts = async () => {
  try {
    const response = await API.get(`products`);

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