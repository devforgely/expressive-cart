import axios from 'axios';

const API = axios.create({
  baseURL: '/api/',
  withCredentials: true
});

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorized = handler;
};

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      const isCredentialAttempt = url.includes('auth/login') || url.includes('auth/register');
      if (!isCredentialAttempt) {
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  }
);

export default API;
