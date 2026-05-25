import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Categories from '../routes/Categories/Categories';
import { checkLoginStatus } from '../store/auth/Auth.actions';
import { useAppDispatch } from '../store/store';
import theme from '../theme/theme';
import CartDrawer from './CartDrawer/CartDrawer';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import PrivateRoute from './PrivateRoute/PrivateRoute';

// 1. Lazy load route components to reduce initial bundle size
const Home = lazy(() => import('../routes/Home/Home'));
const Login = lazy(() => import('../routes/Login/Login'));
const Register = lazy(() => import('../routes/Register/Register'));
const ProductDetails = lazy(() => import('../routes/ProductDetails/ProductDetails'));
const SearchProduct = lazy(() => import('../routes/SearchProduct/SearchProduct'));
// const Account = lazy(() => import('../routes/Account/Account'));
// const Cart = lazy(() => import('../routes/Cart/Cart'));
// const Checkout = lazy(() => import('../routes/Checkout/Checkout'));
// const Orders = lazy(() => import('../routes/Orders/Orders'));
// const OrderDetails = lazy(() => import('../routes/OrderDetails/OrderDetails'));

const App = () => {
  const dispatch = useAppDispatch();

  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const toggleCartDrawer = () => setShowCartDrawer(!showCartDrawer);

  // 2. Simplified useEffect
  useEffect(() => {
    // No need for an async wrapper if you aren't awaiting a subsequent action
    dispatch(checkLoginStatus());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Header toggleCartDrawer={toggleCartDrawer} />
          <CartDrawer showCartDrawer={showCartDrawer} toggleCartDrawer={toggleCartDrawer} />
          {/* 3. Suspense boundary for lazy-loaded routes */}
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/categories/:category" element={<Categories />} />
              <Route path="/products/:productId" element={<ProductDetails />} />
              <Route path="/search" element={<SearchProduct />} />

              {/* 4. Modern v6 Layout Route for Private Routes */}
              <Route element={<PrivateRoute />}>
                {/* <Route path="/account" element={<Account />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} /> */}
              </Route>

              {/* 5. Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Footer />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;