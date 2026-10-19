import { Alert, Button, Chip, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { FormattedDate } from "../../components/FormattedDate/FormattedDate";
import { loadOrder } from "../../store/orders/Orders.actions";
import { addItem } from "../../store/cart/Cart.actions";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addressesMatch, formatAddressLines, type Address } from "../../utils/address";
import { paymentLabel, statusColor, statusLabel } from "../../utils/orderDisplay";
import { STANDARD_SHIPPING_FEE, money } from "../../utils/shipping";

const readError = (err: unknown) => {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string" && err.message) {
    return err.message;
  }
  return "Unable to load this order";
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => (orderId ? state.orders[orderId] : undefined));
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    setLoading(true);
    dispatch(loadOrder(orderId))
      .unwrap()
      .then(() => {
        if (active) setError("");
      })
      .catch((err) => {
        if (active) setError(readError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dispatch, orderId]);

  const status = order?.status || "pending";
  const merchandise = (order?.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = order ? Math.round((order.total - merchandise) * 100) / 100 : 0;
  const showShipping = Math.abs(shipping) < 0.001 || Math.abs(shipping - STANDARD_SHIPPING_FEE) < 0.001;

  return (
    <Container maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
      <Button component={RouterLink} to="/orders" sx={{ mb: 2, px: 0 }}>
        Back to your orders
      </Button>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, justifyContent: "space-between" }}>
        <Typography variant="h4">Order #{orderId}</Typography>
        {order && (
          <Chip label={statusLabel(status)} color={statusColor(status)} />
        )}
      </Stack>

      {loading && <Typography color="text.secondary">Loading order...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}

      {order && (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 2 }}>
            <Stack>
              <Typography variant="caption" color="text.secondary">Placed</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {order.date ? <FormattedDate format="LL">{order.date}</FormattedDate> : "—"}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography sx={{ fontWeight: 700 }}>{money(order.total)}</Typography>
            </Stack>
            {paymentLabel(order) && (
              <Stack>
                <Typography variant="caption" color="text.secondary">Paid with</Typography>
                <Typography sx={{ fontWeight: 700 }}>{paymentLabel(order)}</Typography>
              </Stack>
            )}
            {order.shippingAddress && (
              <AddressBlock label="Delivery address" address={order.shippingAddress} />
            )}
            {order.billingAddress && (
              <AddressBlock
                label="Billing address"
                address={order.billingAddress}
                sameAsDelivery={addressesMatch(order.shippingAddress, order.billingAddress)}
              />
            )}
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <Stack divider={<Divider flexItem />}>
            {(order.items || []).map((item) => (
              <Stack key={item.id} direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ py: 2, alignItems: { sm: "center" } }}>
                <div
                  role="img"
                  aria-label={item.name}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 12,
                    backgroundColor: "#f5f5f5",
                    backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    flexShrink: 0
                  }}
                />
                <Stack sx={{ flexGrow: 1 }} spacing={0.5}>
                  <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                  {item.description && (
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  )}
                  <Typography variant="body2">Qty {item.quantity} · {money(item.price)} each</Typography>
                  <Typography color="primary" sx={{ fontWeight: 800 }}>
                    {money(item.price * item.quantity)}
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  disabled={!item.productId}
                  onClick={() => dispatch(addItem({ productId: item.productId, quantity: item.quantity }))}
                >
                  Buy again
                </Button>
              </Stack>
            ))}
          </Stack>
          {showShipping && (
            <Stack spacing={1} sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography>{Math.abs(shipping) < 0.001 ? "FREE" : money(shipping)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 800 }}>Total</Typography>
                <Typography sx={{ fontWeight: 800 }}>{money(order.total)}</Typography>
              </Stack>
            </Stack>
          )}
        </Paper>
      )}
    </Container>
  );
};

function AddressBlock({ label, address, sameAsDelivery = false }: { label: string; address: Address; sameAsDelivery?: boolean }) {
  const lines = sameAsDelivery ? ["Same as delivery address"] : formatAddressLines(address);

  return (
    <Stack sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      {lines.map((line, index) => (
        <Typography key={`${label}-${index}`} sx={{ fontWeight: 700 }}>{line}</Typography>
      ))}
    </Stack>
  );
}

export default OrderDetails;
