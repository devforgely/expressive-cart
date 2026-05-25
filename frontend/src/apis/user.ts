import API from './client';
import { isAxiosError } from 'axios';

// API interface for loading the user's profile
export const fetchUser = async (userId: string) => {
  try {
    const response = await API.get(`users/${userId}`);

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}

// API interface for updating the user's profile
export const updateUser = async (userId: string, data: Record<string, any>) => {
  try {
    const response = await API.put(`users/${userId}`, data);

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}