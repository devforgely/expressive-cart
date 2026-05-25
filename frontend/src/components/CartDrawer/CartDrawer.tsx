import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, Remove as RemoveIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import { removeItemLocal, updateQuantity, type Item } from "../../store/cart/Cart.reducers";
import { useAppDispatch, useAppSelector } from '../../store/store';

interface CartDrawerProps {
  showCartDrawer: boolean;
  toggleCartDrawer: () => void;
}

const CartDrawer = ({ showCartDrawer, toggleCartDrawer }: CartDrawerProps) => {
  const { items, cartTotal } = useAppSelector(state => state.cart);
  const dispatch = useAppDispatch();
  
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
              <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 3, py: 2, borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: 2, backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{item.name}</Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mb: 1 }}>${item.price.toFixed(2)}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', gap: 1 }}>
                    <IconButton size="small" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}><RemoveIcon fontSize="small" /></IconButton>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}><AddIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => dispatch(removeItemLocal(item.id))} sx={{ ml: 'auto', color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ pt: 3, borderTop: '2px solid #f0f0f0', mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Subtotal</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }} color="primary">${cartTotal.toFixed(2)}</Typography>
            </Box>
            <Button variant="contained" fullWidth size="large" sx={{ py: 1.5, fontSize: '1.1rem' }}>Proceed to Checkout</Button>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;