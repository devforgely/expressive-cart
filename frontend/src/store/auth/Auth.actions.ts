import { createAsyncThunk } from '@reduxjs/toolkit';
import { isLoggedIn, login, register } from '../../apis/auth';

export const checkLoginStatus = createAsyncThunk(
  'auth/checkLoginStatus',
  async () => {
    const response = await isLoggedIn();
    return {
      cart: response.cart,
      isAuthenticated: true,
      user: response.user
    };
  }
);

export interface CredentialsParams {
  email: string;
  password: string;
  confirmPassword?: string;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: CredentialsParams) => {
    const response = await login(credentials);
    return {
      user: response,
      isAuthenticated: true
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    return {
      isAuthenticated: false,
    };
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: CredentialsParams) => {
    await register(credentials);
    return {};
  }
);
