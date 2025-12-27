import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { cardsData } from "./data/cardsData";

const ServiciosSection = () => {
  const navigate = useNavigate();

  const handleCardClick = (grupo, link) => {
    sessionStorage.setItem("selectedGroup", grupo);
    navigate(link);
  };

  return (
    <Box sx={{ bgcolor: "#f1f8ff", py: { xs: 6, md: 8, lg: 10 } }}>
      <Container maxWidth="lg">
        {/* Título principal */}
        <Typography
          variant="h2"
          align="center"
          sx={{
            mb: { xs: 4, md: 6 },
            fontFamily: "'Playfair Display', serif",
            position: "relative",
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            "&::after": {
              content: '""',
              position: "absolute",
              width: 80,
              height: 3,
              background: "#ffb300",
              bottom: -15,
              left: "50%",
              transform: "translateX(-50%)",
            },
          }}
        >
          Soluciones Integrales de Ingeniería
        </Typography>

        {/* Grid de tarjetas */}
        <Grid container spacing={4} justifyContent="center">
          {cardsData.map((card) => (
            <Grid key={card.id} item xs={12} md={6} lg={4}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 8,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={card.image}
                  alt={card.title_es}
                  onError={(e) => (e.target.src = "/img/defecto.png")}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                    {card.title_es}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {card.full_description_es}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleCardClick(card.group, "/Blog")}
                    fullWidth
                  >
                    Ver más
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ServiciosSection;

