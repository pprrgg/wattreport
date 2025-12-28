import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DescriptionIcon from "@mui/icons-material/Description";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import * as XLSX from "xlsx";
import Catalogo from "./Catalogo.json";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InicioSectionPlantillas from "./HomeComponents/InicioSectionPlantillas.jsx";

const NavigationBarDocs = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState(
    () => sessionStorage.getItem("searchText") || ""
  );
  const [openGroup, setOpenGroup] = useState(null);
  const [openSector, setOpenSector] = useState({});
  const [selectedFicha, setSelectedFicha] = useState(() => {
    const stored = sessionStorage.getItem("selectedFicha");
    return stored ? JSON.parse(stored) : null;
  });
  const [expandedSeccion, setExpandedSeccion] = useState(null);
  const [expandedSubseccion, setExpandedSubseccion] = useState({});
  const scrollRefs = useRef({});

  const navigate = useNavigate();

  // Función para normalizar texto
  const normalize = (str = "") =>
    str
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // Función para mostrar solo la parte posterior al guion bajo y reemplazar "_" por espacio
  const displayName = (name) =>
    (name.includes("_") ? name.split("_").slice(1).join("_") : name).replace(
      /_/g,
      " "
    );

  useEffect(() => {
    sessionStorage.setItem("searchText", searchText);
  }, [searchText]);

  // Filtrado de fichas
  const filteredData = useMemo(() => {
    const normalizedSearch = normalize(searchText);
    return Catalogo.filter((item) => {
      const cod = normalize(item.cod);
      const sector = normalize(item.sector);
      const grupo = normalize(item.grupo);
      return (
        !searchText ||
        cod.includes(normalizedSearch) ||
        sector.includes(normalizedSearch) ||
        grupo.includes(normalizedSearch)
      );
    });
  }, [searchText]);

  // Agrupamiento de fichas
  const groupedData = useMemo(() => {
    const grouped = {};
    filteredData.forEach((item) => {
      grouped[item.grupo] ??= {};
      grouped[item.grupo][item.sector] ??= [];
      grouped[item.grupo][item.sector].push(item);
    });

    // Ordenar por nombre completo
    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
      .reduce((acc, grupo) => {
        const sectores = grouped[grupo];
        const sortedSectores = Object.keys(sectores)
          .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
          .reduce((accSec, sector) => {
            const sortedFichas = [...sectores[sector]].sort((a, b) =>
              a.cod.localeCompare(b.cod, "es", { sensitivity: "base" })
            );
            accSec[sector] = sortedFichas;
            return accSec;
          }, {});
        acc[grupo] = sortedSectores;
        return acc;
      }, {});

    return sortedGrouped;
  }, [filteredData]);

  // Expandir primer sección por defecto
  useEffect(() => {
    if (
      groupedData &&
      Object.keys(groupedData).length > 0 &&
      !expandedSeccion
    ) {
      const firstGroup = Object.keys(groupedData)[0];
      setExpandedSeccion(firstGroup);
    }
  }, [groupedData, expandedSeccion]);

  // Función para calcular el total de fichas por grupo
  const getTotalFichasByGroup = (grupo) => {
    if (!groupedData[grupo]) return 0;
    let total = 0;
    Object.values(groupedData[grupo]).forEach((fichas) => {
      total += fichas.length;
    });
    return total;
  };

  const toggleGroup = (group) => {
    setOpenGroup(openGroup === group ? null : group);
    setOpenSector({});
  };

  const toggleSector = (group, sector) => {
    setOpenSector((prev) => ({
      ...prev,
      [group]: prev[group] === sector ? null : sector,
    }));
  };

  // Manejo de acordeones (como en el componente de ayuda)
  const handleSeccionChange = (seccion) => (event, isExpanded) => {
    setExpandedSeccion(isExpanded ? seccion : null);
    setExpandedSubseccion({});
  };

  const handleSubseccionChange = (grupo, subseccion) => (event, isExpanded) => {
    setExpandedSubseccion((prev) => ({
      ...prev,
      [grupo]: isExpanded ? subseccion : null,
    }));

    // Scroll automático cuando se expande
    setTimeout(() => {
      const key = `${grupo}-${subseccion}`;
      const target = accordionRefs.current[key];
      if (isExpanded && target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 250);
  };

  const handleFichaClick = async (ficha) => {
    try {
      setSelectedFicha(ficha);
      sessionStorage.setItem("selectedFicha", JSON.stringify(ficha));

      const filePath = `routers/${ficha.grupo}/${ficha.sector}/${ficha.cod}.xlsx`;
      const response = await fetch(filePath);
      if (!response.ok) throw new Error();

      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetsData = workbook.SheetNames.reduce((acc, sheetName) => {
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        });
        acc[sheetName] = sheet.filter((row) =>
          row.some((cell) => cell != null && cell !== "")
        );
        return acc;
      }, {});
      sessionStorage.setItem("excelData", JSON.stringify(sheetsData));

      setDrawerOpen(false);
      setOpenGroup(null);
      setOpenSector({});
      navigate("/doc");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cargar la ficha seleccionada.");
    }
  };

  // Funciones para el scroll horizontal
  const scrollLeft = (groupSectorId) => {
    const container = scrollRefs.current[groupSectorId];
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (groupSectorId) => {
    const container = scrollRefs.current[groupSectorId];
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };
  const accordionRefs = useRef({});

  return (
    <>
      {/* Botón lateral */}
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: 0,
          zIndex: 1300,
          transform: "translateY(-50%)",
        }}
      >
        <Button
          variant={drawerOpen ? "contained" : "outlined"}
          color="black"
          onClick={() => setDrawerOpen(!drawerOpen)}
          sx={{
            borderRadius: "0 8px 8px 0",
            height: 60,
            width: 33,
            minWidth: 33,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: (theme) => theme.palette.warning.main,
            color: "white",
            border: `2px solid ${(theme) => theme.palette.warning.main}`,
            "&:hover": {
              backgroundColor: "transparent",
              color: (theme) => theme.palette.warning.main,
              borderColor: (theme) => theme.palette.warning.main,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FilterAltIcon sx={{ fontSize: 24 }} />
            <Typography sx={{ fontSize: 18, lineHeight: 1 }}>
              {drawerOpen ? "‹" : "›"}
            </Typography>
          </Box>
        </Button>
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 350, p: 2 } }}
      >
        <TextField
          fullWidth
          placeholder="Buscar plantilla..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterAltIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <List dense>
          {Object.entries(groupedData).map(([grupo, sectores]) => (
            <React.Fragment key={grupo}>
              <ListItemButton onClick={() => toggleGroup(grupo)}>
                {openGroup === grupo ? (
                  <ArrowDropDownIcon />
                ) : (
                  <ArrowRightIcon />
                )}
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{displayName(grupo)}</span>
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 1,
                          backgroundColor: "primary.main",
                          color: "white",
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        {getTotalFichasByGroup(grupo)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>

              <Collapse in={openGroup === grupo}>
                {Object.entries(sectores).map(([sector, fichas]) => (
                  <React.Fragment key={sector}>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() => toggleSector(grupo, sector)}
                    >
                      {openSector[grupo] === sector ? (
                        <ArrowDropDownIcon />
                      ) : (
                        <ArrowRightIcon />
                      )}
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>{displayName(sector)}</span>
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 1,
                                backgroundColor: "info.main",
                                color: "white",
                                px: 1,
                                py: 0.2,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                              }}
                            >
                              {fichas.length}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>

                    <Collapse in={openSector[grupo] === sector}>
                      {fichas.map((f) => (
                        <ListItemButton
                          key={f.cod}
                          sx={{ pl: 8 }}
                          onClick={() => handleFichaClick(f)}
                        >
                          <DescriptionIcon sx={{ mr: 1 }} />
                          <ListItemText
                            primary={
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: "bold",
                                    mr: 1,
                                    color: "text.primary",
                                  }}
                                >
                                  {f.cod.replace(/_/g, " ")}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      ))}
                    </Collapse>
                  </React.Fragment>
                ))}
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      <Box mb={5}></Box>

      {/* Contenido principal con Acordeones */}
      <Box sx={{ ml: { xs: 0 }, p: 2 }}>
        <InicioSectionPlantillas />

        <Container maxWidth={false} disableGutters>
          <Box mb={5} sx={{ width: "100%" }} />

          {Object.entries(groupedData).map(([grupo, sectores]) => {
            const totalGrupo = getTotalFichasByGroup(grupo);

            return (
              <Box key={grupo} sx={{ mb: 4 }}>
                {/* Primer nivel: Grupo */}
                <Accordion
                  expanded={expandedSeccion === grupo}
                  onChange={handleSeccionChange(grupo)}
                  sx={{
                    mb: 2,
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: "#f0f7ff",
                      borderRadius: "8px 8px 0 0",
                      "&.Mui-expanded": {
                        backgroundColor: "#e0f0ff",
                        borderRadius: "8px 8px 0 0",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        pr: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: "darkblue",
                          fontSize: "1.2rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {displayName(grupo)}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: "darkblue",
                            color: "white",
                            px: 2,
                            py: 0.5,
                            borderRadius: "20px",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            minWidth: "40px",
                            textAlign: "center",
                          }}
                        >
                          {totalGrupo}
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 0 }}>
                    {Object.entries(sectores).map(([sector, fichas]) => {
                      const subseccionId = `${grupo}-${sector}`;
                      const isSubseccionExpanded =
                        expandedSubseccion[grupo] === sector;

                      return (
                        <Accordion
                          key={subseccionId}
                          expanded={isSubseccionExpanded}
                          onChange={handleSubseccionChange(grupo, sector)}
                          ref={(el) =>
                            (accordionRefs.current[subseccionId] = el)
                          }
                          sx={{
                            borderRadius: "0",
                            boxShadow: "none",
                            border: "none",
                            "&:before": { display: "none" },
                            "&.Mui-expanded": {
                              margin: 0,
                            },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              backgroundColor: isSubseccionExpanded
                                ? "#e8f4ff"
                                : "#f8fbff",
                              pl: 4,
                              "&.Mui-expanded": {
                                minHeight: "48px",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                pr: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                  color: "darkblue",
                                  fontSize: "1.1rem",
                                }}
                              >
                                {displayName(sector)}
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    backgroundColor: "primary.main",
                                    color: "white",
                                    px: 1.5,
                                    py: 0.25,
                                    borderRadius: "12px",
                                    fontSize: "0.875rem",
                                    fontWeight: "bold",
                                    minWidth: "32px",
                                    textAlign: "center",
                                  }}
                                >
                                  {fichas.length}
                                </Box>
                              </Box>
                            </Box>
                          </AccordionSummary>

                          <AccordionDetails
                            sx={{
                              mt: 2,
                              p: 0,
                              width: "100%",
                              position: "relative",
                            }}
                          >
                            {/* Botón scroll izquierdo */}
                            <IconButton
                              onClick={() => scrollLeft(subseccionId)}
                              sx={{
                                position: "absolute",
                                left: 0,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 2,
                                backgroundColor: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                "&:hover": {
                                  backgroundColor: "#f0f0f0",
                                },
                                display: { xs: "none", md: "flex" },
                              }}
                            >
                              <ChevronLeftIcon />
                            </IconButton>

                            {/* Contenedor scroll horizontal */}
                            <Box
                              ref={(el) =>
                                (scrollRefs.current[subseccionId] = el)
                              }
                              sx={{
                                display: "flex",
                                overflowX: "auto",
                                gap: 2,
                                p: 0,
                                m: 0,
                                width: "100%",
                                scrollbarWidth: "thin",
                                "&::-webkit-scrollbar": {
                                  height: 8,
                                },
                                "&::-webkit-scrollbar-track": {
                                  background: "#f1f1f1",
                                  borderRadius: 4,
                                },
                                "&::-webkit-scrollbar-thumb": {
                                  background: "#888",
                                  borderRadius: 4,
                                },
                                "&::-webkit-scrollbar-thumb:hover": {
                                  background: "#555",
                                },
                              }}
                            >
                              {fichas.map((ficha) => (


<Card
  key={ficha.cod}
  sx={{
    flex: {
      xs: "0 0 100%",
      sm: "0 0 48%",
    },
    minWidth: {
      xs: "100%",
      sm: "48%",
    },
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#fff",
    border: "2px solid darkblue",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "default", // cambia el cursor para toda la card
    display: "flex",
    flexDirection: "column",
    position: "relative",
    "&:hover": {
      transform: "scale(1.03)",
      borderColor: "darkblue",
      boxShadow: "0 6px 18px rgba(0, 0, 139, 0.15)",
    },
  }}
>
  {/* 🔹 TITULO ARRIBA */}
  <Box
    sx={{
      width: "100%",
      backgroundColor: "darkblue",
      color: "white",
      textAlign: "center",
      py: 1,
      px: 1,
      fontWeight: "bold",
      fontSize: { xs: 14, sm: 16 },
      whiteSpace: "normal",
      overflowWrap: "break-word",
    }}
  >
    {ficha.cod.replace(/_/g, " ")}
  </Box>

  {/* 🔹 IMAGEN DEBAJO */}
  <Box
    sx={{
      width: "100%",
      position: "relative",
      paddingTop: "55%",
    }}
  >
    <CardMedia
      component="img"
      image={`/routers/${encodeURIComponent(ficha.grupo)}/${encodeURIComponent(
        ficha.sector
      )}/${encodeURIComponent(ficha.cod)}.png`}
      alt={ficha.cod}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        backgroundColor: "#fafafa",
      }}
      onError={(e) => (e.currentTarget.src = "/img/defecto.png")}
    />
  </Box>

  {/* Botón flotante interactivo */}
  <Button
    variant="outlined"
    sx={{
      position: "absolute",
      bottom: "2%",
      right: "2%",
      borderRadius: "6px",
      borderColor: "transparent",
      color: "darkblue",
      padding: 0.2,
      minWidth: "auto",
      textTransform: "none",
      transition: "all .25s ease",
      zIndex: 3,
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "darkblue",
        color: "#fff",
        borderColor: "darkblue",
      },
    }}
    onClick={() => handleFichaClick(ficha)}
  >
    <NoteAltOutlinedIcon sx={{ fontSize: 50 }} />
  </Button>
</Card>



                              ))}
                            </Box>

                            {/* Botón scroll derecho */}
                            <IconButton
                              onClick={() => scrollRight(subseccionId)}
                              sx={{
                                position: "absolute",
                                right: 0,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 2,
                                backgroundColor: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                "&:hover": {
                                  backgroundColor: "#f0f0f0",
                                },
                                display: { xs: "none", md: "flex" },
                              }}
                            >
                              <ChevronRightIcon />
                            </IconButton>

                            {/* Indicador móvil */}
                            <Typography
                              variant="caption"
                              sx={{
                                display: { xs: "block", md: "none" },
                                textAlign: "center",
                                color: "text.secondary",
                                mt: 1,
                                fontStyle: "italic",
                              }}
                            >
                              ← Desliza para ver más plantillas →
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              </Box>
            );
          })}
        </Container>
      </Box>
    </>
  );
};

export default NavigationBarDocs;
