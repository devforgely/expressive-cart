import { Alert, Box, Button, Snackbar } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Categories from '../routes/Categories/Categories';
import InfoPage from '../routes/Info/Info';
import { checkLoginStatus } from '../store/auth/Auth.actions';
import { addItem, loadCart } from '../store/cart/Cart.actions';
import { clearFeedback } from '../store/cart/Cart.reducers';
import { useAppDispatch, useAppSelector } from '../store/store';
import theme from '../theme/theme';
import { claimPendingCartItem, finishPendingCartItem } from '../utils/pendingCart';
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
const Account = lazy(() => import('../routes/Account/Account'));
const Cart = lazy(() => import('../routes/Cart/Cart'));
const Checkout = lazy(() => import('../routes/Checkout/Checkout'));
const Orders = lazy(() => import('../routes/Orders/Orders'));
const OrderDetails = lazy(() => import('../routes/OrderDetails/OrderDetails'));

const App = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cartNotice = useAppSelector((state) => state.cart.notice);
  const cartError = useAppSelector((state) => state.cart.error);
  const authError = useAppSelector((state) => state.auth.error);

  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const toggleCartDrawer = () => setShowCartDrawer(!showCartDrawer);

  useEffect(() => {
    dispatch(checkLoginStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const claim = claimPendingCartItem();
    if (claim.type === 'busy') return;

    if (claim.type === 'item') {
      dispatch(addItem(claim.item))
        .unwrap()
        .then(() => finishPendingCartItem())
        .catch(() => finishPendingCartItem(claim.item));
      return;
    }

    dispatch(loadCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (authError === 'Your session ended. Please sign in again.') {
      setFeedback({ message: authError, severity: 'error' });
    }
  }, [authError]);

  useEffect(() => {
    if (cartError) {
      setFeedback({ message: cartError, severity: 'error' });
      dispatch(clearFeedback());
      return;
    }
    if (cartNotice) {
      setFeedback({ message: cartNotice, severity: 'success' });
      dispatch(clearFeedback());
    }
  }, [cartError, cartNotice, dispatch]);

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
              <Route path="/shipping" element={<InfoPage page="shipping" />} />
              <Route path="/returns" element={<InfoPage page="returns" />} />
              <Route path="/privacy" element={<InfoPage page="privacy" />} />
              <Route path="/terms" element={<InfoPage page="terms" />} />

              {/* 4. Modern v6 Layout Route for Private Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/account" element={<Account />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
              </Route>

              {/* 5. Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Footer />
          <Snackbar
            open={Boolean(feedback)}
            autoHideDuration={4000}
            onClose={() => setFeedback(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              severity={feedback?.severity || 'success'}
              onClose={() => setFeedback(null)}
              action={feedback?.severity === 'success' ? (
                <Button color="inherit" size="small" onClick={() => { setShowCartDrawer(true); setFeedback(null); }}>
                  View cart
                </Button>
              ) : undefined}
              sx={{ alignItems: 'center' }}
            >
              {feedback?.message}
            </Alert>
          </Snackbar>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;