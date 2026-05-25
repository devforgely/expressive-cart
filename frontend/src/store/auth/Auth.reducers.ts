import { createSlice } from '@reduxjs/toolkit';
import { checkLoginStatus, loginUser, logoutUser, registerUser } from './Auth.actions';

const initialState = {
  user: {
    id: '',
    name: '',
    email: ''
  },
  isAuthenticated: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Check login status success
      .addCase(checkLoginStatus.fulfilled, (state, action) => {
        const { isAuthenticated } = action.payload;
        state.isAuthenticated = isAuthenticated;
      })
      // Login success
      .addCase(loginUser.fulfilled, (state, action) => {
        const { isAuthenticated, user } = action.payload;
        state.isAuthenticated = isAuthenticated;
        state.user = user;
      })
      // Login failure
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = initialState.user;
      })
      // Logout success
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isAuthenticated = false;
        state.user = initialState.user;
      })
      // Registration success
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = false;
        state.user = initialState.user;
      })
      // Registration failure
      .addCase(registerUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = initialState.user;
      })
  }
});

// Export reducer function by default
export default authSlice.reducer;