import API from './client';
import { isAxiosError } from 'axios';

const throwApiError = (err: unknown) => {
  if (isAxiosError(err) && err.response) throw err.response.data;
  throw err;
};

export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await API.post('auth/login', credentials);
    return response.data;
  } catch (err) {
    throwApiError(err);
  }
};

export const register = async (data: { email: string; password: string }) => {
  try {
    const response = await API.post('auth/register', data);
    return response.data;
  } catch (err) {
    throwApiError(err);
  }
};

export const logout = async () => {
  try {
    const response = await API.post('auth/logout');
    return response.data;
  } catch (err) {
    throwApiError(err);
  }
};

export const isLoggedIn = async () => {
  try {
    const response = await API.get('auth/logged_in');
    return response.data;
  } catch (err) {
    throwApiError(err);
  }
};
