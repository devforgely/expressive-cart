import { Box, Card, Typography } from "@mui/material";

interface CategoryBlockProps {
  title: string;
  image: string;
  onClick: () => void;
}

const CategoryBlock = ({ title, image, onClick }: CategoryBlockProps) => (
  <Card onClick={onClick} sx={{ height: '100%', minHeight: 340, display: 'flex', flexDirection: 'column', cursor: 'pointer', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
    <Typography variant="h6" sx={{ p: 2.5, pb: 1.5, fontWeight: 700, fontSize: '1.2rem' }}>{title}</Typography>
    <Box sx={{ px: 2.5, pb: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 1, mb: 2, minHeight: 200 }} />
      <Typography color="primary" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Shop now</Typography>
    </Box>
  </Card>
);

export default CategoryBlock;