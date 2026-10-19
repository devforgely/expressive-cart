import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Alert, Box, Button, Container, Grid, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../apis/product';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import type { Product } from '../../store/products/Products.reducers';

const readError = (err: unknown) => {
  if (typeof err === 'string' && err) return err;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string' && err.message) {
    return err.message;
  }
  return 'Unable to search products';
};

const SearchProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      setError('');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    fetchProducts({ search: query })
      .then((data) => {
        if (!active) return;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!active) return;
        setProducts([]);
        setError(readError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <Container maxWidth="xl" sx={{ py: 6, flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2, bgcolor: 'white', boxShadow: 1 }} aria-label="Back to home">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: '800' }}>
          {query ? `Search results for “${query}”` : 'Search products'}
        </Typography>
      </Box>

      {query && !loading && !error && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {products.length === 1 ? '1 product' : `${products.length} products`}
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!query ? (
        <Box sx={{ py: 12, textAlign: 'center', bgcolor: 'white', borderRadius: 4 }}>
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: '600' }}>
            Enter a product, category, or keyword to search the catalog.
          </Typography>
        </Box>
      ) : loading ? (
        <Box sx={{ py: 12, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: '600' }}>
            Searching...
          </Typography>
        </Box>
      ) : !error && products.length === 0 ? (
        <Box sx={{ py: 12, textAlign: 'center', bgcolor: 'white', borderRadius: 4 }}>
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: '600' }}>
            No products matched “{query}”.
          </Typography>
          <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate('/')}>
            Return Home
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <ProductCard {...product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SearchProduct;
