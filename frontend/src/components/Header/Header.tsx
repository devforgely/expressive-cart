import { Logout as LogoutIcon, Receipt as ReceiptIcon, Search as SearchIcon, ShoppingCart as ShoppingCartIcon, } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, Container, IconButton, InputAdornment, ListItemIcon, Menu, MenuItem, TextField, Typography, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpressiveCartLogo from '../../assets/Expressive.png';
import { logoutUser } from '../../store/auth/Auth.actions';
import { useAppSelector } from '../../store/store';
import theme from '../../theme/theme';

const CATEGORIES = ["All", "Tech", "Fashion", "Home & Kitchen", "Beauty & Wellness", "Garden Essentials", "Must Haves"];

interface HeaderProps {
  toggleCartDrawer: () => void
}

const Header = ({ toggleCartDrawer }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const { items } = useAppSelector(state => state.cart);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState("");

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logoutUser(); handleMenuClose(); };

  const onGoHome = () => {
    navigate('/');
  }

  const onLogin = () => {
    navigate('/login');
  }

  const onCategoryClick = (category: string) => {
    navigate(`/categories/${category}`);
  }

  const onSearchSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = searchQuery.trim();

    if (!trimmed) return;

    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const onOpenOrders = () => {
    navigate('/orders');
  }

  const searchBar = (
    <Box component="form" onSubmit={onSearchSubmit} sx={{ width: '100%', maxWidth: 800 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search categories, items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '8px',
              bgcolor: '#F3F4F6',
              '& fieldset': {
                border: 'none',
              },
            },
          },
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
      <Container maxWidth="xl" disableGutters>
        <Box sx={{ px: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, minHeight: { xs: 56, md: 60 }, py: { xs: 1, md: 0 } }}>
              <Box
                onClick={onGoHome}
                component="img"
                src={ExpressiveCartLogo}
                alt="Expressive Cart Logo"
                sx={{
                  width: { xs: 128, sm: 152, md: 200 },
                  height: { xs: 36, sm: 44, md: 60 },
                  objectFit: 'contain',
                  display: 'block',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />

              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', px: { xs: 2, md: 4 } }}>
                {searchBar}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton color="inherit" onClick={onOpenOrders} sx={{ color: 'text.secondary' }} title="Order History">
                  <ReceiptIcon />
                </IconButton>

                {(isAuthenticated && user) ? (
                  <>
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 14, fontWeight: 'bold' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 200 } } }}
                    >
                      <Box sx={{ px: 2, py: 1.5, mb: 1, bgcolor: 'background.default', borderRadius: 1, mx: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                      <MenuItem onClick={() => { handleMenuClose(); onOpenOrders(); }}><ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>My Orders</MenuItem>
                      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>Sign Out</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button variant="outlined" color="inherit" onClick={onLogin} sx={{ borderRadius: '8px', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' }, borderColor: 'rgba(0,0,0,0.1)' }}>
                    Login
                  </Button>
                )}

                <IconButton color="inherit" onClick={toggleCartDrawer} sx={{ ml: 1, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, borderRadius: '10px' }}>
                  <Badge badgeContent={items.length} color="secondary">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, minHeight: { xs: 56, md: 60 }, py: { xs: 1, md: 0 } }}>
                <Box
                  onClick={onGoHome}
                  component="img"
                  src={ExpressiveCartLogo}
                  alt="Expressive Cart Logo"
                  sx={{
                    width: { xs: 128, sm: 152, md: 200 },
                    height: { xs: 36, sm: 44, md: 60 },
                    objectFit: 'contain',
                    display: 'block',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton color="inherit" onClick={onOpenOrders} sx={{ color: 'text.secondary' }} title="Order History">
                    <ReceiptIcon />
                  </IconButton>

                  {(isAuthenticated && user) ? (
                    <>
                      <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 14, fontWeight: 'bold' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        slotProps={{ paper: { sx: { mt: 1, borderRadius: 2, minWidth: 200 } } }}
                      >
                        <Box sx={{ px: 2, py: 1.5, mb: 1, bgcolor: 'background.default', borderRadius: 1, mx: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                        <MenuItem onClick={() => { handleMenuClose(); onOpenOrders(); }}><ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>My Orders</MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>Sign Out</MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Button variant="outlined" color="inherit" onClick={onLogin} sx={{ borderRadius: '8px', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' }, borderColor: 'rgba(0,0,0,0.1)' }}>
                      Login
                    </Button>
                  )}

                  <IconButton color="inherit" onClick={toggleCartDrawer} sx={{ ml: 1, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, borderRadius: '10px' }}>
                    <Badge badgeContent={items.length} color="secondary">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ pb: 1.5 }}>
                {searchBar}
              </Box>
            </>
          )}
        </Box>
      </Container>
      
      {/* Categories Strip below header */}
      <Box sx={{ bgcolor: '#232F3E', color: 'white' }}>
        <Container maxWidth="xl">
           <Box sx={{ display: 'flex', gap: 4, overflowX: 'auto', py: 1.2, '&::-webkit-scrollbar': { display: 'none' } }}>
             {CATEGORIES.filter(c => c !== 'All').map(cat => (
               <Typography key={cat} onClick={() => onCategoryClick(cat)} sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', transition: 'color 0.2s', '&:hover': { color: '#FBBF24' } }}>
                 {cat}
               </Typography>
             ))}
           </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Header;