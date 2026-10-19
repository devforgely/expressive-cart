import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, Remove as RemoveIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { removeItem, updateItem } from "../../store/cart/Cart.actions";
import type { Item } from "../../store/cart/Cart.reducers";
import { useAppDispatch, useAppSelector } from '../../store/store';
import { money, shippingQuote } from '../../utils/shipping';

interface CartDrawerProps {
  showCartDrawer: boolean;
  toggleCartDrawer: () => void;
}

const CartDrawer = ({ showCartDrawer, toggleCartDrawer }: CartDrawerProps) => {
  const { items, updating } = useAppSelector(state => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const quote = shippingQuote(subtotal);

  const changeQuantity = (item: Item, quantity: number) => {
    if (!item.cartItemId || updating) return;
    if (quantity < 1) {
      dispatch(removeItem(item.cartItemId));
      return;
    }
    dispatch(updateItem({ cartItemId: item.cartItemId, quantity }));
  };
  
  return (
    <Drawer anchor="right" open={showCartDrawer} onClose={toggleCartDrawer} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 400 }, p: 3, display: 'flex', flexDirection: 'column' } } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Your Cart</Typography>
        <IconButton onClick={toggleCartDrawer}><CloseIcon /></IconButton>
      </Box>

      {items.length === 0 ? (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: 0.6 }}>
          <ShoppingCartIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6">Your cart is empty.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Discover items that express who you are.</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
            {items.map((item: Item) => (
              <Box key={item.cartItemId || item.id} sx={{ display: 'flex', gap: 2, mb: 3, py: 2, borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: 2, backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{item.name}</Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>{money(item.price)}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', gap: 1 }}>
                    <IconButton size="small" disabled={updating} onClick={() => changeQuantity(item, item.quantity - 1)} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}><RemoveIcon fontSize="small" /></IconButton>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                    <IconButton size="small" disabled={updating || item.quantity >= item.stock} onClick={() => changeQuantity(item, item.quantity + 1)} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}><AddIcon fontSize="small" /></IconButton>
                    <IconButton size="small" disabled={updating} onClick={() => dispatch(removeItem(item.cartItemId))} sx={{ ml: 'auto', color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ pt: 3, borderTop: '2px solid #f0f0f0', mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{money(subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Shipping</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{quote.shipping === 0 ? 'FREE' : money(quote.shipping)}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {quote.shipping === 0 ? 'Free shipping on this order.' : `Add ${money(quote.remaining)} for free shipping.`}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }} color="primary">{money(quote.total)}</Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ py: 1.5, fontSize: '1.1rem' }}
              onClick={() => {
                toggleCartDrawer();
                navigate('/cart');
              }}
            >
              View cart
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
