import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import CloseIcon from "@mui/icons-material/Close";

const InicioSection = () => {
  const [open, setOpen] = useState(false);

  const abrirVideo = () => setOpen(true);
  const cerrarVideo = () => setOpen(false);

  return (
    <>
      {/* HERO SECTION */}
      <Box
        id="inicio"
        sx={{
          background: `
    linear-gradient(rgba(13, 71, 161, 0.85), rgba(21, 101, 192, 0.55)),
    url(img//1.png)
  `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          py: { xs: 8, sm: 10, md: 12, lg: 15 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          {/* Title */}
          <Typography
            variant="h1"
            sx={{
              fontSize: {
                xs: "2rem",
                sm: "2.5rem",
                md: "3rem",
                lg: "3.5rem",
              },
              mb: 3,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
            }}
          >
            InformeTécnico.app
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h5"
            sx={{
              maxWidth: 800,
              mx: "auto",
              mb: 5,
              opacity: 0.9,
              fontSize: {
                xs: "1rem",
                sm: "1.1rem",
                md: "1.25rem",
              },
              px: { xs: 2, sm: 0 },
            }}
          >
            Genera informes técnicos profesionales en minutos. Sin instalación,
            sin registro y totalmente gratuito.
          </Typography>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              color="warning"
              size="large"
              onClick={abrirVideo}
              sx={{
                px: { xs: 3, md: 4 },
                py: { xs: 1.2, md: 1.5 },
                fontWeight: 700,
              }}
            >
              Ver cómo funciona
            </Button>

            {/* <Button
              variant="outlined"
              color="inherit"
              size="large"
              href="#pasos"
              sx={{
                px: { xs: 3, md: 4 },
                py: { xs: 1.2, md: 1.5 },
                borderColor: "rgba(255,255,255,0.7)",
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Ver pasos
            </Button> */}
          </Stack>

          {/* Play icon */}
          {/* <Box sx={{ mt: 6 }}>
            <IconButton
              onClick={abrirVideo}
              sx={{
                color: "#fff",
                transition: "0.3s",
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              <PlayCircleFilledWhiteIcon sx={{ fontSize: "4rem" }} />
            </IconButton>
          </Box> */}
        </Container>
      </Box>

      {/* VIDEO MODAL */}
      <Dialog
        fullScreen
        open={open}
        onClose={cerrarVideo}
        PaperProps={{
          sx: {
            backgroundColor: "black",
            position: "relative",
          },
        }}
      >
        <IconButton
          onClick={cerrarVideo}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.4)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.2)",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: "2rem" }} />
        </IconButton>

        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: 2,
          }}
        >
          <video
            src="video/1.mp4"
            controls
            autoPlay
            style={{ width: "100%", maxHeight: "100vh" }}
          />
        </Box>
      </Dialog>
    </>
  );
};

export default InicioSection;
