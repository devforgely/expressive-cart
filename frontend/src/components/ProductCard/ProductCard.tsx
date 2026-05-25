import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { Product } from '../../store/products/Products.reducers';


export const ProductCard = ({ id, name, price, imageUrl, category, stock }: Product) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }} onClick={() => navigate(`/products/${id}`)}>
      <Box sx={{ position: 'relative', pt: '100%', bgcolor: '#f5f5f5' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {!stock && (
          <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>
            Out of Stock
          </Box>
        )}
      </Box>
      <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" color="secondary" sx={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
          {category}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 1, lineHeight: 1.3, fontWeight: '700' }}>
          {name}
        </Typography>
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: '800' }}>
            ${price.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};