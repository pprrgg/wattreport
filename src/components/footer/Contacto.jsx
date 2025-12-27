import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
} from "@mui/material";
import { toast } from "react-toastify";
import { PDF_API_URL } from "../HomeComponents/data/constants";

const ContactoSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    requestType: "",
    area: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        formDataToSend.append(key === "requestType" ? "request_type" : key, value)
      );

      const response = await fetch(PDF_API_URL, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.status === "ok") {
        toast.success("Formulario enviado correctamente");
        setFormData({
          name: "",
          email: "",
          organization: "",
          requestType: "",
          area: "",
          message: "",
        });
      } else {
        toast.error("Error al enviar el formulario");
      }
    } catch (error) {
      toast.error("Ocurrió un error al enviar el formulario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "white", py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          align="center"
          sx={{
            mb: 5,
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
          Contacto
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: "#fff",
            p: { xs: 3, md: 4 },
            borderRadius: "12px",
            boxShadow: 3,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Entidad / Empresa"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Objeto</InputLabel>
                <Select
                  name="requestType"
                  value={formData.requestType}
                  label="Objeto"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Selecciona una opción</em>
                  </MenuItem>
                  <MenuItem value="contribuir">Contribuir</MenuItem>
                  <MenuItem value="modificar">Modificar</MenuItem>
                  <MenuItem value="asesoria">Asesoría</MenuItem>
                  <MenuItem value="otros">Otros</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Área</InputLabel>
                <Select
                  name="area"
                  value={formData.area}
                  label="Área"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Selecciona un área</em>
                  </MenuItem>
                  <MenuItem value="contratos">Contratos de energía</MenuItem>
                  <MenuItem value="instalaciones">Instalaciones</MenuItem>
                  <MenuItem value="energias-renovables">
                    Energías renovables
                  </MenuItem>
                  <MenuItem value="CAEs">
                    Certificados de ahorro energético
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mensaje"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} textAlign="center" mt={2}>
              <Box
                component="button"
                type="submit"
                disabled={loading}
                sx={{
                  bgcolor: "primary.main",
                  color: "#fff",
                  px: 5,
                  py: 1.5,
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "0.3s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": {
                    bgcolor: !loading && "primary.dark",
                    transform: !loading && "translateY(-2px)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                ) : (
                  "Enviar"
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactoSection;
