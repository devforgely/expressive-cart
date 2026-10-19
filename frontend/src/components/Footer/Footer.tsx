import { Box, Container, Divider, Grid, Link as MuiLink, List, ListItem, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const CATEGORIES = ["Tech", "Fashion", "Home & Kitchen", "Beauty & Wellness"];

const SUPPORT = [
  { label: "Your Account", to: "/account" },
  { label: "Your Orders", to: "/orders" },
  { label: "Shipping Rates", to: "/shipping" },
  { label: "Returns & Replacements", to: "/returns" }
];

const linkSx = {
  color: "inherit",
  opacity: 0.7,
  textDecoration: "none",
  "&:hover": { opacity: 1, textDecoration: "underline" }
};

const Footer = () => (
  <Box sx={{ bgcolor: '#232F3E', color: 'white', py: 8, mt: 'auto' }}>
    <Container maxWidth="xl">
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Expressive Cart</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 320, lineHeight: 1.7 }}>
            Your premium destination for tech, fashion, and lifestyle essentials. Quality delivered directly to your door.
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 800 }}>Shop</Typography>
          <List dense sx={{ p: 0 }}>
            {CATEGORIES.map((category) => (
              <ListItem key={category} disableGutters sx={{ py: 0.5 }}>
                <MuiLink component={RouterLink} to={`/categories/${encodeURIComponent(category)}`} variant="body2" sx={linkSx}>
                  {category}
                </MuiLink>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 800 }}>Support</Typography>
          <List dense sx={{ p: 0 }}>
            {SUPPORT.map((link) => (
               <ListItem key={link.label} disableGutters sx={{ py: 0.5 }}>
                <MuiLink component={RouterLink} to={link.to} variant="body2" sx={linkSx}>
                  {link.label}
                </MuiLink>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      <Divider sx={{ my: 5, borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Expressive Cart. All rights reserved.{" "}
          |{" "}
          <MuiLink component={RouterLink} to="/privacy" variant="body2" sx={linkSx}>Privacy Policy</MuiLink>
          {" "}|{" "}
          <MuiLink component={RouterLink} to="/terms" variant="body2" sx={linkSx}>Terms of Service</MuiLink>
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default Footer;
