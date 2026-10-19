import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { removeItem, updateItem } from '../../store/cart/Cart.actions';
import type { Item } from '../../store/cart/Cart.reducers';
import { useAppDispatch, useAppSelector } from '../../store/store';

const money = (amount: number) => `$${Number(amount || 0).toFixed(2)}`;

function CartItemCard({ item }: { item: Item }) {
  const dispatch = useAppDispatch();
  const updating = useAppSelector((state) => state.cart.updating);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ py: 2, alignItems: { sm: 'center' } }}>
      <div
        role="img"
        aria-label={item.name}
        style={{
          width: 96,
          height: 96,
          borderRadius: 12,
          backgroundColor: '#f5f5f5',
          backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0
        }}
      />
      <Stack sx={{ flexGrow: 1 }} spacing={0.5}>
        <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
        <Typography variant="body2" color="text.secondary">{money(item.price)} each</Typography>
      </Stack>
      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <IconButton
          aria-label="Decrease quantity"
          disabled={updating}
          onClick={() => {
            if (item.quantity <= 1) {
              dispatch(removeItem(item.cartItemId));
              return;
            }
            dispatch(updateItem({ cartItemId: item.cartItemId, quantity: item.quantity - 1 }));
          }}
        >
          <RemoveIcon />
        </IconButton>
        <Typography sx={{ px: 2, fontWeight: 600 }}>{item.quantity}</Typography>
        <IconButton
          aria-label="Increase quantity"
          disabled={updating || item.quantity >= item.stock}
          onClick={() => dispatch(updateItem({ cartItemId: item.cartItemId, quantity: item.quantity + 1 }))}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <Typography sx={{ fontWeight: 800, minWidth: 80 }}>{money(item.price * item.quantity)}</Typography>
      <Button color="error" disabled={updating} onClick={() => dispatch(removeItem(item.cartItemId))}>
        Remove
      </Button>
    </Stack>
  );
}

export default CartItemCard;
