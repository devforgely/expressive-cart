import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryBlock from '../../components/CategoryBlock/CategoryBlock';
import HorizontalProductList from '../../components/HorizontalProductList/HorizontalProductList';
import PromoCarousel from '../../components/PromoCarousel/PromoCarousel';
import { loadProducts } from '../../store/products/Products.actions';
import { useAppDispatch, useAppSelector } from '../../store/store';

import CategoryBeauty from '../../assets/category_beauty.jpg';
import CategoryTech from '../../assets/category_tech.jpg';
import CategoryGarden from '../../assets/category_garden.jpg';
import CategoryKitchen from '../../assets/category_kitchen.jpg';
import CategoryFashion from '../../assets/category_fashion.jfif';
import CategoryMustHaves from '../../assets/category_must_have.jfif';
import CategoryTopPicks from '../../assets/category_top_picks.jpg';
import CategoryLastestTech from '../../assets/category_latest_tech.jfif';
import SaleTime from '../../assets/sale_time.jpg';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const productState = useAppSelector(state => state.products);
  const products = Object.values(productState);

  useEffect(() => {
    async function load() {
      await dispatch(loadProducts());
    }
    load();
  }, [dispatch]);

  return (
    <section>
      <Box sx={{ pb: 8 }}>
        <PromoCarousel />

        {/* Overlay Blocks */}
        <Container maxWidth="xl" sx={{ mt: { xs: -6, md: -18, lg: -22 }, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <CategoryBlock title="Top Picks for You" image={CategoryTopPicks} onClick={() => navigate("/categories/Must Haves")} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CategoryBlock title="Popular Categories" image={CategoryTech} onClick={() => navigate("/categories/Tech")} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CategoryBlock title="Beauty & Wellness" image={CategoryBeauty} onClick={() => navigate("/categories/Beauty & Wellness")} />
              </Grid>
          </Grid>
        </Container>

        <Container maxWidth="xl" sx={{ mt: 3 }}>
          {/* Standard Blocks requested */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><CategoryBlock title="Garden Essentials" image={CategoryGarden} onClick={() => navigate("/categories/Garden Essentials")} /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><CategoryBlock title="Must Have Products" image={CategoryMustHaves} onClick={() => navigate("/categories/Must Haves")} /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><CategoryBlock title="Latest Tech" image={CategoryLastestTech} onClick={() => navigate("/categories/Tech")} /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><CategoryBlock title="Home & Kitchen" image={CategoryKitchen} onClick={() => navigate("/categories/Home & Kitchen")} /></Grid>
          </Grid>

          {/* Buy Again Section */}
          <HorizontalProductList title="Buy it again" products={products} />

          {/* Additional Block requested Fashion */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <CategoryBlock title="Fashion Trends" image={CategoryFashion} onClick={() => navigate("/categories/Fashion")} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${SaleTime})`, backgroundSize: 'cover' }}>
                  <Typography variant="h4" color="primary.main" sx={{ mb: 2, fontWeight: '800' }}>Sign in for your best experience</Typography>
                  <Button variant="contained" size="large" sx={{ px: 6, py: 1.5, borderRadius: '30px' }}>Sign in securely</Button>
              </Box>
            </Grid>
          </Grid>

          {/* Recommended Section */}
          <HorizontalProductList title="Recommended for you based on trends" products={products} />
        </Container>
      </Box>
    </section>
  );
};

export default Home;
