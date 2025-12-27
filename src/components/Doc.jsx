import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebaseConfig";
import axios from "axios";
import {
  Backdrop,
  CircularProgress,
  Box,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  LinearProgress,
} from "@mui/material";
import config from "./configURL";
import XLSXUploaderStoragePrecargaxDefectoHojaModal from "./XLSXUploaderStoragePrecargaxDefectoHojaModal";
import TuneIcon from "@mui/icons-material/Tune";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.js",
  import.meta.url
).toString();

const Doc = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiDisponible, setApiDisponible] = useState(null);
  const [navValue, setNavValue] = useState(0);

  const pdfContainerRef = useRef(null);
  const pdfIntentado = useRef(false);
  const currentPdfBlobRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const progressStartTimeRef = useRef(null);
  const apiCallStartedRef = useRef(false);

  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const isMobile = true;

  const ep = JSON.parse(sessionStorage.getItem("selectedFicha") || "null");

  // Función para iniciar progreso MUY lento
  const startSlowProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setProgress(0);
    progressStartTimeRef.current = Date.now();
    apiCallStartedRef.current = false;

    // Contador para la animación de decimales
    let decimalCounter = 0;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStartTimeRef.current;
      const elapsedSeconds = elapsed / 1000;

      // Progreso base
      let baseProgress;
      if (elapsedSeconds < 10) {
        baseProgress = (elapsedSeconds / 10) * 40;
      } else if (elapsedSeconds < 40) {
        baseProgress = 40 + ((elapsedSeconds - 10) / 30) * 35;
      } else if (elapsedSeconds < 90) {
        baseProgress = 75 + ((elapsedSeconds - 40) / 50) * 10;
      } else {
        baseProgress = 85;
      }

      // Efecto de decimales "corriendo" - pequeña oscilación
      decimalCounter++;
      const decimalOscillation = Math.sin(decimalCounter * 0.3) * 0.2;

      let newProgress = baseProgress + decimalOscillation;
      newProgress = Math.min(Math.max(newProgress, 0), 85);

      setProgress(newProgress);

      if (apiCallStartedRef.current && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }, 80); // 80ms para ver decimales corriendo rápidamente
  };
  // Función para completar progreso rápidamente cuando responde la API
  const completeProgressOnApiResponse = () => {
    apiCallStartedRef.current = true;

    // Limpiar intervalo de progreso lento
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Saltar directamente a 100%
    setProgress(100);

    // Ocultar la barra después de un breve momento
    setTimeout(() => {
      setLoading(false);
      setUpdating(false);
      setProgress(0);
    }, 500);
  };

  // Limpiar intervalos
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  if (!ep) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography color="error">
          No se encontró ninguna ficha seleccionada. Regrese al catálogo y elija
          un documento.
        </Typography>
      </Box>
    );
  }

  const ENDPOINT = `${ep.grupo}/${ep.sector}/${ep.cod}/f`;
  const pdfPath = `/routers/${ep.grupo}/${ep.sector}/${ep.cod}.pdf`;

  // ---------------------------
  //      RENDER PDF
  // ---------------------------
  const renderPdfWithPdfJs = async (pdfData, isFromApi = false) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const container = pdfContainerRef.current;
      if (!container) return;

      container.innerHTML = "";

      const scale = 1.8;
      const margin = 60;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const renderCanvas = document.createElement("canvas");
        renderCanvas.width = viewport.width;
        renderCanvas.height = viewport.height;
        const ctx = renderCanvas.getContext("2d");

        await page.render({ canvasContext: ctx, viewport }).promise;

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = viewport.width - margin * 2 * scale;
        cropCanvas.height = viewport.height - margin * 2 * scale;
        const cropCtx = cropCanvas.getContext("2d");

        cropCtx.drawImage(
          renderCanvas,
          margin * scale,
          margin * scale,
          cropCanvas.width,
          cropCanvas.height,
          0,
          0,
          cropCanvas.width,
          cropCanvas.height
        );

        cropCanvas.style.width = "100%";
        cropCanvas.style.height = "auto";
        cropCanvas.style.display = "block";

        const card = document.createElement("div");
        card.style.width = "100%";
        card.style.maxWidth = "100%";
        card.style.marginBottom = "24px";
        card.appendChild(cropCanvas);

        container.appendChild(card);
      }

      // Solo completar progreso si es desde la API
      if (isFromApi) {
        completeProgressOnApiResponse();
      }
    } catch (err) {
      console.error(err);
      setError(`Error al renderizar PDF: ${err.message}`);
      completeProgressOnApiResponse();
    }
  };

  // ---------------------------
  //      CARGAR PDF
  // ---------------------------
  const fetchPdfData = async () => {
    try {
      if (!updating) {
        setLoading(true);
        startSlowProgress(); // Iniciar progreso MUY lento
      } else {
        startSlowProgress();
      }

      setError(null);

      const parametros = JSON.parse(
        sessionStorage.getItem("excelData") || "{}"
      );
      const PDF_API_URL = `${
        config.API_URL
      }/${ENDPOINT}?timestamp=${Date.now()}`;

      // 1. Cargar PDF local primero (esto no completa el progreso)
      const localResponse = await fetch(pdfPath);
      if (!localResponse.ok) throw new Error("No se encontró el PDF local.");

      const localPdfData = new Uint8Array(await localResponse.arrayBuffer());
      currentPdfBlobRef.current = new Blob([localPdfData], {
        type: "application/pdf",
      });

      // Renderizar PDF local pero NO completar progreso
      await renderPdfWithPdfJs(localPdfData, false);
      setApiDisponible(false);

      // 2. Intentar cargar PDF desde API (esto SÍ completa el progreso)
      try {
        setUpdating(true);

        // Hacer la llamada a la API
        const apiResponse = await axios.post(PDF_API_URL, parametros, {
          responseType: "arraybuffer",
          timeout: 20000,
        });

        if (apiResponse.status === 200 && apiResponse.data) {
          setApiDisponible(true);
          const apiPdfData = new Uint8Array(apiResponse.data);

          currentPdfBlobRef.current = new Blob([apiPdfData], {
            type: "application/pdf",
          });

          // Renderizar PDF de la API y completar progreso
          await renderPdfWithPdfJs(apiPdfData, true);
        } else {
          // Si la API responde pero sin datos, igual completar progreso
          completeProgressOnApiResponse();
        }
      } catch (err) {
        console.warn("API no disponible. Usando PDF local.");
        // Si falla la API, mostrar que estamos usando local y completar progreso
        completeProgressOnApiResponse();
      }
    } catch (err) {
      console.error("No se pudo cargar PDF:", err);
      setError("No se pudo cargar el PDF.");
      completeProgressOnApiResponse();
    }
  };

  // ---------------------------
  //   EFECTO INICIAL
  // ---------------------------
  useEffect(() => {
    if (pdfIntentado.current) return;
    pdfIntentado.current = true;

    fetchPdfData();
  }, []);

  // ---------------------------
  //      DESCARGAR PDF
  // ---------------------------
  const handleDownload = () => {
    if (!currentPdfBlobRef.current) {
      setError("No hay PDF disponible para descargar");
      return;
    }

    const url = URL.createObjectURL(currentPdfBlobRef.current);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ep.cod}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 200);
  };

  useImperativeHandle(ref, () => ({
    abrirModalx: () => setDrawerOpen(true),
    handleDownload,
  }));

  const handleNavigationChange = (event, newValue) => {
    setNavValue(newValue);
    if (newValue === 0) setDrawerOpen(true);
    if (newValue === 1) handleDownload();
    if (newValue === 2) navigate("/Blog");
  };

  return (
    <>
      {/* Barra de progreso MUY lenta */}
      {(loading || updating) && (
        <Backdrop
          open={true}
          sx={{
            zIndex: 1201,
            color: "#333", // Cambiado a color oscuro para que se vea mejor
            flexDirection: "column",
            gap: 2,
            backgroundColor: "transparent", // Fondo completamente transparente
          }}
        >
          <Box
            sx={{
              width: "80%",
              maxWidth: 500,
              backgroundColor: "rgba(255, 255, 255, 0.95)", // Fondo blanco semi-transparente
              borderRadius: 2,
              padding: 3,
              border: "2px solid rgba(0, 0, 0, 0.2)", // Marco oscuro
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)", // Sombra para destacar
            }}
          >
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#333" }}
            >
              {progress < 100 ? "Simulando..." : "¡Documento listo!"}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 14,
                borderRadius: 7,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(0, 0, 0, 0.3)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 7,
                  backgroundColor: "#1976d2",
                  transition: "transform 0.3s ease",
                },
              }}
            />

            <Typography
              variant="h6"
              align="center"
              sx={{
                mt: 2,
                fontWeight: "bold",
                color: progress === 100 ? "#2e7d32" : "#1976d2",
              }}
            >
              {progress.toFixed(1)}%
            </Typography>

            {progress >= 40 && progress < 100 && (
              <Typography
                variant="body2"
                align="center"
                sx={{
                  mt: 1,
                  color: "rgba(0, 0, 0, 0.6)",
                  fontStyle: "italic",
                }}
              >
                Esto puede tomar unos segundos...
              </Typography>
            )}
          </Box>
        </Backdrop>
      )}

      {error && (
        <Typography align="center" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box mb={6}></Box>

      <Box display="flex" flexDirection="column" alignItems="center">
        <div
          ref={pdfContainerRef}
          style={{
            width: "100%",
            maxWidth: "900px",
            padding: 0,
            margin: "0 auto",
            opacity: loading || updating ? 0.3 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
      </Box>

      {apiDisponible === true && isMobile && !updating && (
        <BottomNavigation
          value={navValue}
          onChange={handleNavigationChange}
          sx={{
            width: "100%",
            position: "fixed",
            bottom: 0,
            bgcolor: "white",
            borderTop: "1px solid #ddd",
            zIndex: 1300,
          }}
          showLabels
        >
          <BottomNavigationAction
            label="Personalizar"
            icon={<TuneIcon />}
            sx={{
              color: navValue === 0 ? "blue" : "gray",
              "&:hover, &.Mui-focusVisible": {
                backgroundColor: "black !important",
                color: "white !important",
              },
              "&:hover .MuiBottomNavigationAction-label, &.Mui-focusVisible .MuiBottomNavigationAction-label":
                {
                  color: "white !important",
                },
              "&:hover .MuiSvgIcon-root, &.Mui-focusVisible .MuiSvgIcon-root": {
                color: "white !important",
                fill: "white !important",
              },
            }}
          />

          <BottomNavigationAction
            label="Descargar"
            icon={<PictureAsPdfIcon />}
            sx={{
              color: navValue === 1 ? "blue" : "gray",
              "&:hover, &.Mui-focusVisible": {
                backgroundColor: "black !important",
                color: "white !important",
              },
              "&:hover .MuiBottomNavigationAction-label, &.Mui-focusVisible .MuiBottomNavigationAction-label":
                {
                  color: "white !important",
                },
              "&:hover .MuiSvgIcon-root, &.Mui-focusVisible .MuiSvgIcon-root": {
                color: "white !important",
                fill: "white !important",
              },
            }}
          />

          <BottomNavigationAction
            label="Cerrar"
            icon={<CloseIcon />}
            onClick={() => navigate("/Blog")}
            sx={{
              color: "gray",
              "&:hover, &.Mui-focusVisible": {
                backgroundColor: "black !important",
                color: "white !important",
              },
              "&:hover .MuiBottomNavigationAction-label, &.Mui-focusVisible .MuiBottomNavigationAction-label":
                {
                  color: "white !important",
                },
              "&:hover .MuiSvgIcon-root, &.Mui-focusVisible .MuiSvgIcon-root": {
                color: "white !important",
                fill: "white !important",
              },
            }}
          />
        </BottomNavigation>
      )}

      <XLSXUploaderStoragePrecargaxDefectoHojaModal
        openx={drawerOpen}
        cerrarModalx={() => setDrawerOpen(false)}
        handleRecalculate={async () => {
          setDrawerOpen(false);
          setUpdating(true);
          startSlowProgress(); // Iniciar progreso lento para recálculo
          await fetchPdfData();
        }}
      />

      <ToastContainer />

      {apiDisponible === false && !loading && (
        <Typography align="center" color="error">
          API no disponible, usando el PDF local.
        </Typography>
      )}
    </>
  );
});

export default Doc;
