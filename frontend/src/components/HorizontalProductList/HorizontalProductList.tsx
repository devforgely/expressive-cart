import { Box, Typography } from "@mui/material";
import type { Product } from "../../store/products/Products.reducers";
import { useNavigate } from "react-router-dom";

interface HorizontalProductListProps {
  title: string;
  products: Product[];
}

const HorizontalProductList = ({ title, products }: HorizontalProductListProps) => {
    const navigate = useNavigate();

    const onProductClick = (product: Product) => {
        navigate(`/product/${product.id}`);
    };

    return (
    <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>{title}</Typography>
        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 4 } }}>
            {products.map(p => (
            <Box key={p.id} sx={{ minWidth: 160, width: 160, cursor: 'pointer', '&:hover img': { transform: 'scale(1.05)' } }} onClick={() => onProductClick(p)}>
                <Box sx={{ height: 160, bgcolor: '#f8f8f8', borderRadius: 2, mb: 1.5, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={p.imageUrl} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', mb: 0.5, lineHeight: 1.2 }}>{p.name}</Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>${p.price.toFixed(2)}</Typography>
            </Box>
            ))}
        </Box>
    </Box>
    );
};

export default HorizontalProductList;