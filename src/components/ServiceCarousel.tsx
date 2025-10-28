import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useState } from "react";
import { services } from "../data/services";

export default function ServiceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;

  const handleNext = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= services.length ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? services.length - itemsPerView : prev - 1
    );
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <IconButton onClick={handlePrev}>
        <KeyboardArrowLeft />
      </IconButton>

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        overflow: 'hidden',
        flex: 1 
      }}>
        {services
          .slice(currentIndex, currentIndex + itemsPerView)
          .map((service) => (
            <Card key={service.id} sx={{ flex: 1, minWidth: 250 }}>
              <CardContent>
                <Typography variant="h6">{service.name}</Typography>
                <Typography variant="body2">
                  Duración: {service.duration} min
                </Typography>
              </CardContent>
            </Card>
          ))}
      </Box>

      <IconButton onClick={handleNext}>
        <KeyboardArrowRight />
      </IconButton>
    </Box>
  );
}