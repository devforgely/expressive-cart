import { Box, Button, Container, Grid, List, ListItem, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Incrementer } from '../../components/Incrementer/Incrementer';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { savePendingCartItem } from '../../utils/pendingCart';

import { addItem } from '../../store/cart/Cart.actions';
import { loadProduct } from '../../store/products/Products.actions';

const ProductDetails = () => {

  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [ quantity, setQuantity ] = useState(1);

  const dispatch = useAppDispatch();
  const products = useAppSelector(state => state.products);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const updating = useAppSelector(state => state.cart.updating);
  const product = productId ? products[productId] : undefined;

  useEffect(() => {
    if (productId && !products[productId]) {
      (async function load() {
        await dispatch(loadProduct(productId))
      })();
    }
  }, [dispatch, products, productId]);

  function handleIncrement() {
    setQuantity(quantity + 1);
  }

  function handleDecrement() {
    setQuantity(Math.max(1, quantity - 1));
  }

  function handleAddToCart() {
    if (!product) return;

    if (!isAuthenticated) {
      savePendingCartItem({ productId: product.id, quantity });
      const next = encodeURIComponent(`${location.pathname}${location.search}`);
      navigate(`/login?next=${next}`);
      return;
    }

    dispatch(addItem({ productId: product.id, quantity }));
  }

  return (
    <section>
      <Container maxWidth="md">
        <Grid container>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ height: { xs: 300, md: '100%' }, minHeight: 400, backgroundImage: `url(${product?.imageUrl ?? ""})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="caption" color="secondary" sx={{ fontWeight:"700", textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{product?.category ?? "N/A"}</Typography>
              <Typography variant="h4" sx={{ fontWeight:"800", mb: 2, lineHeight: 1.2 }}>{product?.name ?? "N/A"}</Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight:"800", mb: 3 }}>${product?.price.toFixed(2) ?? "0.00"}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>{product?.description ?? ""}</Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '700', mb: 1 }}>Key Details</Typography>
                <List dense sx={{ p: 0 }}>
                  {product?.details.map((detail, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}><Typography variant="body2" color="text.secondary">• {detail}</Typography></ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ mt: 'auto' }}>
                <Incrementer value={quantity} onIncrement={handleIncrement} onDecrement={handleDecrement} isDisabled={!product?.stock} title="Quantity" />
                <Button variant="contained" fullWidth size="large" onClick={handleAddToCart} disabled={!product?.stock || updating} sx={{ py: 1.5, fontSize: '1.1rem' }}>
                  {product?.stock ? 'Add to Cart' : 'Currently Unavailable'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
};

export default ProductDetails;
