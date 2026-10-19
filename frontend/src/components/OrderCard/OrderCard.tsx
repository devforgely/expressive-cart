import { Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { FormattedDate } from "../FormattedDate/FormattedDate";
import type { Order } from "../../store/orders/Orders.reducers";
import { addItem } from "../../store/cart/Cart.actions";
import { useAppDispatch } from "../../store/store";
import { paymentLabel, statusColor, statusLabel } from "../../utils/orderDisplay";

const money = (amount: number) => `$${Number(amount || 0).toFixed(2)}`;

export const OrderCard = ({ order }: { order: Order }) => {
  const dispatch = useAppDispatch();
  const status = order.status || "pending";
  const items = order.items || [];
  const payment = paymentLabel(order);

  return (
    <Paper variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ px: 2.5, py: 2, bgcolor: "#F3F4F6", justifyContent: "space-between" }}
      >
        <Stack spacing={0.25}>
          <Typography variant="caption" color="text.secondary">Order placed</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {order.date ? <FormattedDate format="LL">{order.date}</FormattedDate> : "—"}
          </Typography>
        </Stack>
        <Stack spacing={0.25}>
          <Typography variant="caption" color="text.secondary">Total</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{money(order.total)}</Typography>
        </Stack>
        <Stack spacing={0.25}>
          <Typography variant="caption" color="text.secondary">Order</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>#{order.id}</Typography>
        </Stack>
        {payment && (
          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary">Paid with</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{payment}</Typography>
          </Stack>
        )}
        {order.shippingAddress && (
          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary">Delivery</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {[order.shippingAddress.city, order.shippingAddress.postalCode].filter(Boolean).join(", ")}
            </Typography>
          </Stack>
        )}
        <Chip label={statusLabel(status)} color={statusColor(status)} size="small" sx={{ alignSelf: { sm: "center" } }} />
      </Stack>
      <Divider />
      <Stack divider={<Divider flexItem />} sx={{ px: 2.5 }}>
        {items.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 2 }}>No items were recorded for this order.</Typography>
        )}
        {items.map((item) => (
          <Stack key={item.id} direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ py: 2, alignItems: { sm: "center" } }}>
            <BoxImage src={item.imageUrl} alt={item.name} />
            <Stack sx={{ flexGrow: 1 }} spacing={0.5}>
              <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">Qty {item.quantity}</Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>{money(item.price)}</Typography>
            </Stack>
            <Button
              variant="outlined"
              disabled={!item.productId}
              onClick={() => dispatch(addItem({ productId: item.productId, quantity: 1 }))}
            >
              Buy again
            </Button>
          </Stack>
        ))}
      </Stack>
      <Divider />
      <Stack direction="row" sx={{ px: 2.5, py: 1.5, justifyContent: "flex-end" }}>
        <Button component={RouterLink} to={`/orders/${order.id}`} variant="contained">
          View order
        </Button>
      </Stack>
    </Paper>
  );
};

function BoxImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        width: 84,
        height: 84,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        flexShrink: 0
      }}
    />
  );
}
