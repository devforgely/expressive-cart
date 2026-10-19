import { Button, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CartItemCard from '../../components/CartItemCard/CartItemCard';
import { useAppSelector } from '../../store/store';
import { money, shippingQuote } from '../../utils/shipping';

const Cart = () => {
  const { items } = useAppSelector(state => state.cart);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const quote = shippingQuote(subtotal);

  return (
    <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Your Cart</Typography>
      {items.length === 0 ? (
        <Stack spacing={2} sx={{ py: 6, px: 3, bgcolor: 'background.paper', borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6">Your cart is empty.</Typography>
          <Typography color="text.secondary">Items you add are saved to your account.</Typography>
          <Button component={RouterLink} to="/" variant="contained" sx={{ alignSelf: 'center' }}>
            Continue shopping
          </Button>
        </Stack>
      ) : (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'flex-start' }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
            <Stack divider={<Divider flexItem />}>
              {items.map((item) => (
                <CartItemCard key={item.cartItemId || item.id} item={item} />
              ))}
            </Stack>
          </Paper>
          <Paper sx={{ p: { xs: 3, md: 4 }, width: { xs: '100%', md: 380 }, flexShrink: 0, position: { md: 'sticky' }, top: 96 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Order summary</Typography>
            <Stack spacing={2.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography>Subtotal</Typography>
                <Typography>{money(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography>Shipping</Typography>
                <Typography>{quote.shipping === 0 ? 'FREE' : money(quote.shipping)}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {quote.shipping === 0
                  ? 'Free shipping on this order.'
                  : `Add ${money(quote.remaining)} for free shipping.`}
              </Typography>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 800 }}>Total</Typography>
                <Typography sx={{ fontWeight: 800 }}>{money(quote.total)}</Typography>
              </Stack>
              <Button component={RouterLink} to="/checkout" variant="contained" fullWidth size="large">
                Checkout
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Container>
  );
};

export default Cart;
