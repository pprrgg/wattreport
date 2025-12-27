import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { servicios } from "./data/serviciosData";

const LandingSection = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 8, position: "relative", zIndex: 1 }}
    >
      {/* Encabezado */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            color: "black",
            fontWeight: "bold",
          }}
        >
          Servicios de Ingeniería
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(0,0,0,0.8)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          "De la idea a la realidad: Soluciones de ingeniería integrales, llave en mano."
        </Typography>
      </Box>

      {/* Call to Action */}
      <Box textAlign="center" mt={6}>
        <Button
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            background: "rgba(25, 118, 210, 0.9)",
            border: "1px solid rgba(0,0,0,0.1)",
            "&:hover": {
              background: "rgba(21, 101, 192, 0.9)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
          onClick={() => navigate("/contacto")}
        >
          Solicitar Propuesta Personalizada
        </Button>
      </Box>
      
      <Divider sx={{ my: 4, backgroundColor: "rgba(0,0,0,0.2)" }} />

      {/* Servicios en Grid */}
      <Grid container spacing={4}>
        {servicios.map((servicio, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                height: "100%",
                background: "white",
                border: `2px solid rgba(0, 0, 0, 0.2)`,
                borderRadius: "12px",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "visible",
                "&:hover": {
                  transform: "translateY(-8px)",
                  border: `2px solid ${servicio.color}`,
                  boxShadow: `0 8px 32px ${servicio.color}60`,
                  "&::before": {
                    opacity: 1,
                  },
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-3px",
                  left: "-3px",
                  right: "-3px",
                  bottom: "-3px",
                  background: `linear-gradient(45deg, transparent, ${servicio.color}20, transparent)`,
                  borderRadius: "14px",
                  zIndex: -1,
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header del servicio */}
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 3 }}
                >
                  <Box
                    sx={{
                      color: servicio.color,
                      mr: 2,
                      fontSize: "2.2rem",
                    }}
                  >
                    {servicio.icono}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      color: "black",
                      fontWeight: "bold",
                    }}
                  >
                    {servicio.titulo}
                  </Typography>
                </Box>

                {/* Lista de items */}
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {servicio.items.map((item, itemIndex) => (
                    <Typography
                      component="li"
                      variant="body1"
                      key={itemIndex}
                      sx={{
                        mb: 1.5,
                        color: "rgba(0,0,0,0.9)",
                        fontWeight: 500,
                        "&:before": {
                          content: '"▸"',
                          color: servicio.color,
                          fontWeight: "bold",
                          display: "inline-block",
                          width: "1em",
                          marginLeft: "-1em",
                        },
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Acordeón para versión móvil */}
      <Box sx={{ display: { xs: "block", md: "none" }, mt: 4 }}>
        {servicios.map((servicio, index) => (
          <Accordion
            key={index}
            sx={{
              background: "white",
              border: `1px solid rgba(0, 0, 0, 0.2)`,
              color: "black",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon sx={{ color: servicio.color }} />
              }
              sx={{
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    color: servicio.color,
                    mr: 2,
                    fontSize: "1.8rem",
                  }}
                >
                  {servicio.icono}
                </Box>
                <Typography variant="h6" sx={{ color: "black" }}>
                  {servicio.titulo}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                {servicio.items.map((item, itemIndex) => (
                  <Typography
                    component="li"
                    variant="body1"
                    key={itemIndex}
                    sx={{
                      mb: 1.5,
                      color: "rgba(0,0,0,0.9)",
                      "&:before": {
                        content: '"▸"',
                        color: servicio.color,
                        fontWeight: "bold",
                        display: "inline-block",
                        width: "1em",
                        marginLeft: "-1em",
                      },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default LandingSection;
