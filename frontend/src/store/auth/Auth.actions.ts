import { createAsyncThunk } from '@reduxjs/toolkit';
import { isLoggedIn, login, logout, register } from '../../apis/auth';
import { updateUser } from '../../apis/user';

const errorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'string' && err) {
    return err;
  }
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' && err.message) {
    return err.message;
  }
  return fallback;
};

export const checkLoginStatus = createAsyncThunk(
  'auth/checkLoginStatus',
  async (_, { getState }) => {
    const startedWhileAuthenticated = Boolean(
      (getState() as { auth: { isAuthenticated: boolean } }).auth.isAuthenticated
    );
    const response = await isLoggedIn();
    return {
      cart: response.cart,
      isAuthenticated: Boolean(response.loggedIn),
      user: response.user,
      startedWhileAuthenticated
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
  async (credentials: CredentialsParams, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      return {
        user: response,
        isAuthenticated: true
      };
    } catch (err) {
      return rejectWithValue(errorMessage(err, 'Unable to log in'));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await logout();
    } catch {
      // Clear the client session even if the API call fails.
    }
    return {
      isAuthenticated: false,
    };
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    { userId, firstName, lastName }: { userId: string; firstName: string; lastName: string },
    { rejectWithValue }
  ) => {
    try {
      const user = await updateUser(userId, { firstName, lastName });
      if (!user) {
        return rejectWithValue('Unable to update your account');
      }
      return { user };
    } catch (err) {
      return rejectWithValue(errorMessage(err, 'Unable to update your account'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: CredentialsParams, { rejectWithValue }) => {
    try {
      const response = await register(credentials);
      return {
        user: response,
        isAuthenticated: true
      };
    } catch (err) {
      return rejectWithValue(errorMessage(err, 'Unable to create account'));
    }
  }
);
