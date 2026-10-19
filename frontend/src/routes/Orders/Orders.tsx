import { Alert, Button, Container, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { OrderCard } from "../../components/OrderCard/OrderCard";
import { loadOrders } from "../../store/orders/Orders.actions";
import { useAppDispatch, useAppSelector } from "../../store/store";

const readError = (err: unknown) => {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string" && err.message) {
    return err.message;
  }
  return "Unable to load your orders";
};

const Orders = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => Object.values(state.orders));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    dispatch(loadOrders())
      .unwrap()
      .catch((err) => {
        if (active) setError(readError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  return (
    <Container maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
      <Typography variant="h4">Your Orders</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        {loading ? "Loading your order history..." : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && orders.length === 0 && (
        <Stack spacing={2} sx={{ py: 6, px: 3, bgcolor: "background.paper", borderRadius: 3, textAlign: "center" }}>
          <Typography variant="h6">You have not placed any orders yet.</Typography>
          <Typography color="text.secondary">When you check out, the order will show up here with its items, total, and date.</Typography>
          <Button component={RouterLink} to="/" variant="contained" sx={{ alignSelf: "center" }}>
            Continue shopping
          </Button>
        </Stack>
      )}

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </Container>
  );
};

export default Orders;
