import { Box, Button, Container, Grid, IconButton, Typography } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { type Product } from "../../store/products/Products.reducers";
import { useNavigate, useParams } from "react-router-dom";


const Categories = () => {
    const navigate = useNavigate();
    const { category } = useParams();
    
    const filteredProducts = [] as Product[];

    const onGoHome = () => {
        navigate('/');
    }
    
    return (
    <Container maxWidth="xl" sx={{ py: 6, flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
         <IconButton onClick={onGoHome} sx={{ mr: 2, bgcolor: 'white', boxShadow: 1 }}><ArrowBackIcon /></IconButton>
         <Typography variant="h4" sx={{ fontWeight: '800' }}>
           {`Exploring: ${category}`}
         </Typography>
      </Box>
      
      {filteredProducts.length === 0 ? (
         <Box sx={{ py: 12, textAlign: 'center', bgcolor: 'white', borderRadius: 4 }}>
           <Typography variant="h5" color="text.secondary" sx={{ fontWeight: '600' }}>
             No items found matching your criteria.
           </Typography>
           <Button variant="outlined" sx={{ mt: 3 }} onClick={onGoHome}>
             Return Home
           </Button>
         </Box>
      ) : (
         <Grid container spacing={4}>
           {filteredProducts.map(p => (
             <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
                <ProductCard {...p} />
             </Grid>
           ))}
         </Grid>
      )}
    </Container>
  );
};

export default Categories;