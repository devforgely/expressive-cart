import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { combineReducers } from 'redux';
import { setUnauthorizedHandler } from '../apis/client';
import authReducer, { sessionExpired } from './auth/Auth.reducers';
import cartReducer from './cart/Cart.reducers';
import orderReducer from './orders/Orders.reducers';
import productReducer from './products/Products.reducers';
import userReducer from './user/User.reducers';



// Initializes redux store
const store = configureStore({
    reducer: combineReducers({
        auth: authReducer,
        user: userReducer,
        products: productReducer,
        cart: cartReducer,
        orders: orderReducer
    })
});

setUnauthorizedHandler(() => {
  if (store.getState().auth.isAuthenticated) {
    store.dispatch(sessionExpired());
  }
});

export default store;
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()