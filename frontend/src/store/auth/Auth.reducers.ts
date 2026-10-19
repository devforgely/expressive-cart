import { createSlice } from '@reduxjs/toolkit';
import { checkLoginStatus, loginUser, logoutUser, registerUser, updateProfile } from './Auth.actions';

type SessionUser = {
  id?: string | number;
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
};

const toAuthUser = (user?: SessionUser | null) => {
  const firstName = user?.firstName || user?.first_name || '';
  const lastName = user?.lastName || user?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const emailName = user?.email ? user.email.split('@')[0] : '';

  return {
    id: String(user?.id ?? ''),
    name: user?.name || fullName || emailName,
    email: user?.email || '',
    firstName,
    lastName
  };
};

const initialState = {
  user: {
    id: '',
    name: '',
    email: '',
    firstName: '',
    lastName: ''
  },
  isAuthenticated: false,
  authStatus: 'unknown' as 'unknown' | 'known',
  error: null as string | null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired(state) {
      state.isAuthenticated = false;
      state.user = initialState.user;
      state.authStatus = 'known';
      state.error = 'Your session ended. Please sign in again.';
    }
  },
  extraReducers: builder => {
    builder
      // Check login status success
      .addCase(checkLoginStatus.fulfilled, (state, action) => {
        const { isAuthenticated, user, startedWhileAuthenticated } = action.payload;
        state.authStatus = 'known';
        // A login that finished while this check was in flight is newer than a logged-out response.
        if (state.isAuthenticated && !isAuthenticated && !startedWhileAuthenticated) {
          return;
        }
        state.isAuthenticated = isAuthenticated;
        state.user = isAuthenticated && user ? toAuthUser(user) : initialState.user;
        state.error = null;
      })
      .addCase(checkLoginStatus.rejected, (state) => {
        state.authStatus = 'known';
      })
      // Login success
      .addCase(loginUser.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { isAuthenticated, user } = action.payload;
        state.isAuthenticated = isAuthenticated;
        state.user = toAuthUser(user);
        state.error = null;
      })
      // Login failure
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = initialState.user;
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to log in';
      })
      // Logout success
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = initialState.user;
        state.error = null;
      })
      // Registration success
      .addCase(registerUser.pending, (state) => {
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { isAuthenticated, user } = action.payload;
        state.isAuthenticated = isAuthenticated;
        state.user = toAuthUser(user);
        state.error = null;
      })
      // Registration failure
      .addCase(registerUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = initialState.user;
        state.error = typeof action.payload === 'string' ? action.payload : 'Unable to create account';
      })
      .addCase(updateProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = toAuthUser(action.payload.user);
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        const message = typeof action.payload === 'string' ? action.payload : 'Unable to update your account';
        if (message === 'Authentication required') return;
        state.error = message;
      })
  }
});

export const { sessionExpired } = authSlice.actions;

// Export reducer function by default
export default authSlice.reducer;