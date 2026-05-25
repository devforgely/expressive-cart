import { createTheme } from "@mui/material";


const theme = createTheme({
  palette: {
    primary: { main: '#4F46E5', light: '#818CF8', dark: '#3730A3', contrastText: '#ffffff' },
    secondary: { main: '#EC4899', light: '#F472B6', dark: '#BE185D', contrastText: '#ffffff' },
    background: { default: '#F9FAFB', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#4B5563' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '8px', padding: '8px 24px', boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }, '&.MuiButton-containedPrimary': { background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' } }
      }
    },
    MuiCard: { styleOverrides: { root: { borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } } }
  }
});

export default theme;