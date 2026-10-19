import { Alert, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { updateProfile } from "../../store/auth/Auth.actions";
import { useAppDispatch, useAppSelector } from "../../store/store";

const Account = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const error = useAppSelector((state) => state.auth.error);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
  }, [user.firstName, user.lastName]);

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  const unchanged = trimmedFirst === user.firstName && trimmedLast === user.lastName;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setSaving(true);
    try {
      await dispatch(updateProfile({
        userId: user.id,
        firstName: trimmedFirst,
        lastName: trimmedLast
      })).unwrap();
      setSaved(true);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6, flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Your Account</Typography>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{user.email}</Typography>
        <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
          <TextField
            label="First name"
            name="firstName"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              setSaved(false);
            }}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          <TextField
            label="Last name"
            name="lastName"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
              setSaved(false);
            }}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          {saved && <Alert severity="success">Your name was saved.</Alert>}
          {error && !saved && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disabled={saving || unchanged}>
            {saving ? "Saving..." : "Save name"}
          </Button>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
          <Button component={RouterLink} to="/orders" variant="outlined">Your Orders</Button>
          <Button component={RouterLink} to="/cart" variant="outlined">Your Cart</Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Account;
