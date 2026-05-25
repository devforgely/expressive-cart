import { Box, Container, Typography, List, ListItem, Divider, Grid } from "@mui/material";

const CATEGORIES = ["All", "Tech", "Fashion", "Home & Kitchen", "Beauty & Wellness", "Garden Essentials", "Must Haves"];

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
            {CATEGORIES.slice(1, 5).map(c => (
              <ListItem key={c} disableGutters sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1, textDecoration: 'underline' } }}>{c}</Typography>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 800 }}>Support</Typography>
          <List dense sx={{ p: 0 }}>
            {['Your Account', 'Your Orders', 'Shipping Rates', 'Returns & Replacements', 'Help'].map(l => (
               <ListItem key={l} disableGutters sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1, textDecoration: 'underline' } }}>{l}</Typography>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      <Divider sx={{ my: 5, borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Expressive Cart. All rights reserved. | Privacy Policy | Terms of Service
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default Footer;