import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import Promo1 from "../../assets/promo1.jfif";
import Promo2 from "../../assets/promo2.jfif";
import Promo3 from "../../assets/promo3.jfif";

const PromoCarousel = () => {
  const [activeStep, setActiveStep] = useState(0);
  const slides = [
    { img: Promo1, title: "Holiday Deals" },
    { img: Promo2, title: "New Arrivals" },
    { img: Promo3, title: "Elevate Your Space" }
  ];

  useEffect(() => {
    const timer = setInterval(() => { setActiveStep((prev) => (prev + 1) % slides.length); }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: {xs: 300, md: 500}, overflow: 'hidden' }}>
      {slides.map((slide, index) => (
         <Box key={index} sx={{ 
           position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
           opacity: index === activeStep ? 1 : 0, transition: 'opacity 0.8s ease-in-out', 
           backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(249,250,251,1)), url(${slide.img})`, 
           backgroundSize: 'cover', backgroundPosition: 'center top' 
         }} />
      ))}
      <IconButton sx={{ position: 'absolute', top: {xs: '40%', md: '30%'}, left: 16, bgcolor: 'rgba(255,255,255,0.7)', '&:hover':{bgcolor: 'white'}, zIndex: 10 }} onClick={() => setActiveStep(prev => (prev - 1 + slides.length) % slides.length)}>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton sx={{ position: 'absolute', top: {xs: '40%', md: '30%'}, right: 16, bgcolor: 'rgba(255,255,255,0.7)', '&:hover':{bgcolor: 'white'}, zIndex: 10 }} onClick={() => setActiveStep(prev => (prev + 1) % slides.length)}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

export default PromoCarousel;