import { LockOutlined as LockIcon } from "@mui/icons-material";
import { Alert, Box, Button, Checkbox, Container, Divider, FormControlLabel, Paper, Stack, TextField, Typography } from "@mui/material";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { checkoutCart } from "../../store/cart/Cart.actions";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { emptyAddress, normalizeAddress, validateAddress, type Address, type AddressErrors } from "../../utils/address";
import { money, shippingQuote } from "../../utils/shipping";

const cardOptions = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      "::placeholder": { color: "#9CA3AF" }
    },
    invalid: { color: "#BE185D" }
  }
};

const addressFields: { key: keyof Address; label: string; autoComplete: string; required?: boolean }[] = [
  { key: "fullName", label: "Full name", autoComplete: "name", required: true },
  { key: "line1", label: "Address line 1", autoComplete: "address-line1", required: true },
  { key: "line2", label: "Address line 2", autoComplete: "address-line2" },
  { key: "city", label: "City", autoComplete: "address-level2", required: true },
  { key: "region", label: "State / region", autoComplete: "address-level1", required: true },
  { key: "postalCode", label: "Postal code", autoComplete: "postal-code", required: true },
  { key: "country", label: "Country", autoComplete: "country-name", required: true }
];

function AddressFields({
  idPrefix,
  value,
  errors,
  onChange
}: {
  idPrefix: string;
  value: Address;
  errors: AddressErrors;
  onChange: (key: keyof Address, next: string) => void;
}) {
  return (
    <Stack spacing={2}>
      {addressFields.map((field) => (
        <TextField
          key={field.key}
          id={`${idPrefix}-${field.key}`}
          label={field.label}
          autoComplete={`${idPrefix === "delivery" ? "shipping" : "billing"} ${field.autoComplete}`}
          value={value[field.key]}
          required={field.required}
          fullWidth
          error={Boolean(errors[field.key])}
          helperText={errors[field.key] || (field.key === "line2" ? "Optional" : undefined)}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
      ))}
    </Stack>
  );
}

const readError = (err: unknown) => {
  if (typeof err === "string" && err) return err;
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string" && err.message) {
    return err.message;
  }
  return "Unable to place your order";
};

export const CheckoutForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const elements = useElements();
  const stripe = useStripe();
  const cart = useAppSelector((state) => state.cart);
  const [isPaymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [shippingAddress, setShippingAddress] = useState<Address>(emptyAddress);
  const [billingAddress, setBillingAddress] = useState<Address>(emptyAddress);
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
  const [shippingErrors, setShippingErrors] = useState<AddressErrors>({});
  const [billingErrors, setBillingErrors] = useState<AddressErrors>({});

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const quote = shippingQuote(subtotal);

  async function processPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements || cart.items.length === 0) return;

    setError("");
    setPaymentLoading(true);

    try {
      const nextShippingErrors = validateAddress(shippingAddress);
      const nextBillingErrors = billingSameAsDelivery ? {} : validateAddress(billingAddress);
      setShippingErrors(nextShippingErrors);
      setBillingErrors(nextBillingErrors);
      if (Object.keys(nextShippingErrors).length || Object.keys(nextBillingErrors).length) {
        setError("Enter the delivery and billing addresses to continue.");
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Enter your card details to continue.");
        return;
      }

      const delivery = normalizeAddress(shippingAddress);
      const billing = billingSameAsDelivery ? delivery : normalizeAddress(billingAddress);
      const { token, error: stripeError } = await stripe.createToken(cardElement, {
        name: billing.fullName,
        address_line1: billing.line1,
        address_line2: billing.line2 || undefined,
        address_city: billing.city,
        address_state: billing.region,
        address_zip: billing.postalCode
      });
      if (stripeError || !token) {
        setError(stripeError?.message || "Check the card details and try again.");
        return;
      }

      await dispatch(checkoutCart({
        cartId: cart.id,
        paymentInfo: token,
        shippingAddress: delivery,
        billingAddress: billing
      })).unwrap();
      navigate("/orders");
    } catch (err) {
      setError(readError(err));
    } finally {
      setPaymentLoading(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, flexGrow: 1 }}>
        <Paper sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 1 }}>Checkout</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Your cart is empty.</Typography>
          <Button component={RouterLink} to="/" variant="contained">Continue shopping</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flexGrow: 1 }}>
      <Typography variant="h4">Checkout</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        Shipping is free on orders of $30 or more.
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}>
        <Paper component="form" onSubmit={processPayment} sx={{ p: { xs: 2.5, sm: 4 }, flexGrow: 1, width: { xs: "100%", md: "auto" }, minWidth: 0 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Delivery address</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Where should we send this order?
          </Typography>
          <AddressFields
            idPrefix="delivery"
            value={shippingAddress}
            errors={shippingErrors}
            onChange={(key, next) => {
              setShippingAddress((current) => ({ ...current, [key]: next }));
              setShippingErrors((current) => ({ ...current, [key]: undefined }));
            }}
          />

          <FormControlLabel
            sx={{ mt: 2, mb: billingSameAsDelivery ? 3 : 1, alignItems: "center" }}
            control={(
              <Checkbox
                checked={billingSameAsDelivery}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setBillingSameAsDelivery(checked);
                  setBillingErrors({});
                  if (!checked) {
                    setBillingAddress(shippingAddress);
                  }
                }}
              />
            )}
            label="Billing address is the same as the delivery address"
          />

          {!billingSameAsDelivery && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Billing address</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The address for the card payment.
              </Typography>
              <AddressFields
                idPrefix="billing"
                value={billingAddress}
                errors={billingErrors}
                onChange={(key, next) => {
                  setBillingAddress((current) => ({ ...current, [key]: next }));
                  setBillingErrors((current) => ({ ...current, [key]: undefined }));
                }}
              />
            </Box>
          )}

          <Divider sx={{ mb: 3 }} />
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
            <LockIcon fontSize="small" color="primary" />
            <Typography variant="h6">Payment</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your card number, expiry, and CVC. The billing postal code comes from the address above.
          </Typography>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              px: 2,
              py: 1.75,
              bgcolor: "background.paper",
              "& .StripeElement": { width: "100%" }
            }}
          >
            <CardElement options={cardOptions} />
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isPaymentLoading || !stripe}
            sx={{ mt: 3 }}
          >
            {isPaymentLoading ? "Processing..." : `Pay ${money(quote.total)}`}
          </Button>
        </Paper>

        <Paper sx={{ p: { xs: 2.5, sm: 4 }, width: { xs: "100%", md: 380 }, flexShrink: 0, position: { md: "sticky" }, top: 96 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Order summary</Typography>
          <Stack spacing={2} divider={<Divider flexItem />} sx={{ mb: 2 }}>
            {cart.items.map((item) => (
              <Stack key={item.cartItemId || item.id} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  role="img"
                  aria-label={item.name}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    flexShrink: 0,
                    bgcolor: "background.default",
                    backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Qty {item.quantity}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{money(item.price * item.quantity)}</Typography>
              </Stack>
            ))}
          </Stack>
          <Stack spacing={1.25}>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography>Subtotal</Typography>
              <Typography>{money(subtotal)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography>Shipping</Typography>
              <Typography>{quote.shipping === 0 ? "FREE" : money(quote.shipping)}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {quote.shipping === 0
                ? "Free shipping on this order."
                : `Add ${money(quote.remaining)} for free shipping.`}
            </Typography>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography sx={{ fontWeight: 800 }}>{money(quote.total)}</Typography>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
