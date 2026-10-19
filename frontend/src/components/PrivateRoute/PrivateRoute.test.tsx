import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import authReducer from '../../store/auth/Auth.reducers';
import PrivateRoute from './PrivateRoute';

function renderWithAuth(isAuthenticated: boolean) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated,
        authStatus: 'known' as const,
        user: { id: '1', name: 'Ada', email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' },
        error: null
      }
    }
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/account" element={<div>Account page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('PrivateRoute', () => {
  it('renders the protected page when authenticated', () => {
    renderWithAuth(true);
    expect(screen.getByText('Account page')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    renderWithAuth(false);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
