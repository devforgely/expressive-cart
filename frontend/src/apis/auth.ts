import API from './client';
import { isAxiosError } from 'axios';

// API interface for logging a user in
export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await API.post('auth/login', credentials);

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}

// API interface for registering a user
export const register = async (data: { email: string; password: string }) => {
  try {
    const response = await API.post('auth/register', data);

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}

// API interface for verifying the logged in status of a user
export const isLoggedIn = async () => {
  try {
    const response = await API.get('auth/logged_in');

    return response.data;

  } catch (err) {
    if (isAxiosError(err) && err.response) throw err.response.data;
    throw err;
  }
}