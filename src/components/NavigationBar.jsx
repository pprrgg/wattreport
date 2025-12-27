import React, { useState, useMemo } from "react";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  TextField,
  InputAdornment,
  Box,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PolicyIcon from "@mui/icons-material/Policy";
import InfoIcon from "@mui/icons-material/Info";
import GavelIcon from "@mui/icons-material/Gavel";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LanguageIcon from "@mui/icons-material/Language";

import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import Catalogo from "./Catalogo.json";

export default function TopNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ---------------- STATE ----------------
  const [topValue, setTopValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const [searchText, setSearchText] = useState(
    () => sessionStorage.getItem("searchText") || ""
  );
  const [openGroup, setOpenGroup] = useState(null);
  const [openSector, setOpenSector] = useState({});

  // LANGUAGE SELECTOR
  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const [language, setLanguage] = useState("es"); // default 🇪🇸 Español
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // ---------------- CONFIG ----------------
  const pages = [
    { label: "Inicio", icon: <HomeIcon />, path: "/" },
    { label: "Informes", icon: <NoteAltOutlinedIcon />, path: "/Blog" },
    { label: "Ayuda", icon: <HelpOutlineIcon />, path: "/ayuda" },
  ];

  const bottomMenu = [
    { label: "Contacto", path: "/contacto", icon: <ContactMailIcon fontSize="small" /> },
    { label: "Términos", path: "/terminos", icon: <GavelIcon fontSize="small" /> },
    { label: "Privacidad", path: "/privacidad", icon: <PolicyIcon fontSize="small" /> },
    { label: "Sobre IT", path: "/sobre", icon: <InfoIcon fontSize="small" /> },
  ];

  // ---------------- HELPERS ----------------
  const normalize = (str = "") =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/_/g, " ")
      .trim();

  // ---------------- DATA ----------------
  const filteredData = useMemo(() => {
    const search = normalize(searchText);
    return Catalogo.filter(
      (i) =>
        !search ||
        normalize(i.cod).includes(search) ||
        normalize(i.sector).includes(search) ||
        normalize(i.grupo).includes(search)
    );
  }, [searchText]);

  const groupedData = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      acc[item.grupo] ??= {};
      acc[item.grupo][item.sector] ??= [];
      acc[item.grupo][item.sector].push(item);
      return acc;
    }, {});
  }, [filteredData]);

  // ---------------- ACTIVE INDEX (URL SYNC) ----------------
  const activeBottomIndex = bottomMenu.findIndex(
    (item) => item.path === location.pathname
  );

  // ---------------- HANDLERS ----------------
  const handleFichaClick = async (ficha) => {
    try {
      const filePath = `routers/${ficha.grupo}/${ficha.sector}/${ficha.cod}.xlsx`;
      const response = await fetch(filePath);
      if (!response.ok) throw new Error();

      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      const sheets = workbook.SheetNames.reduce((acc, name) => {
        acc[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 });
        return acc;
      }, {});

      sessionStorage.setItem("excelData", JSON.stringify(sheets));
      sessionStorage.setItem("selectedFicha", JSON.stringify(ficha));

      setAnchorEl(null);
      setOpenGroup(null);
      setOpenSector({});
      navigate("/doc");
    } catch {
      toast.error("No se pudo cargar la ficha");
    }
  };

  // LANGUAGE HANDLERS
  const handleLangClick = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangSelect = (lang) => {
    if (lang === "es") {
      setLanguage(lang);
    } else {
      const langNames = {
        en: "English",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
      };
      setSnackbarMessage(`${langNames[lang]} is not available for your IP.`);
      setSnackbarOpen(true);
    }
    setLangAnchorEl(null);
  };

  return (
    <>
      {/* TOP NAV */}
      <AppBar position="fixed" sx={{ bgcolor: "white", borderBottom: "1px solid #ddd", boxShadow: "none" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* BottomNavigation para páginas */}
          <BottomNavigation
            value={topValue}
            showLabels
            onChange={(event, newValue) => {
              const item = pages[newValue];
              setTopValue(newValue);
              if (item.isMenu) setAnchorEl(event.currentTarget);
              else if (item.path) {
                setAnchorEl(null);
                navigate(item.path);
              }
            }}
            sx={{ bgcolor: "white", flexGrow: 1 }}
          >
            {pages.map((item) => (
              <BottomNavigationAction key={item.label} label={item.label} icon={item.icon} />
            ))}
          </BottomNavigation>

          {/* Selector de idioma vertical */}
          <IconButton onClick={handleLangClick} sx={{ flexDirection: "column" }}>
            <LanguageIcon />
            <Typography variant="caption">{language === "es" ? "🇪🇸 Español" : language}</Typography>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* PLANTILLAS MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 350, maxHeight: "70vh", p: 1 } }}
      >
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            fullWidth
            placeholder="Selecciona la plantilla..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterAltIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List dense>
          {Object.entries(groupedData).map(([grupo, sectores]) => (
            <React.Fragment key={grupo}>
              <ListItemButton onClick={() => setOpenGroup(grupo)}>
                {openGroup === grupo ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                <ListItemText primary={grupo.replaceAll("_", " ")} />
              </ListItemButton>

              <Collapse in={openGroup === grupo}>
                {Object.entries(sectores).map(([sector, fichas]) => (
                  <React.Fragment key={sector}>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      onClick={() =>
                        setOpenSector((p) => ({
                          ...p,
                          [grupo]: p[grupo] === sector ? null : sector,
                        }))
                      }
                    >
                      {openSector[grupo] === sector ? (
                        <ArrowDropDownIcon />
                      ) : (
                        <ArrowRightIcon />
                      )}
                      <ListItemText primary={sector.replaceAll("_", " ")} />
                    </ListItemButton>

                    <Collapse in={openSector[grupo] === sector}>
                      {fichas.map((f) => (
                        <ListItemButton
                          key={f.cod}
                          sx={{ pl: 8 }}
                          onClick={() => handleFichaClick(f)}
                        >
                          <DescriptionIcon sx={{ mr: 1 }} />
                          <ListItemText primary={f.cod.replaceAll("_", " ")} />
                        </ListItemButton>
                      ))}
                    </Collapse>
                  </React.Fragment>
                ))}
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Menu>

      {/* LANGUAGE MENU */}
      <Menu
        anchorEl={langAnchorEl}
        open={Boolean(langAnchorEl)}
        onClose={() => setLangAnchorEl(null)}
      >
<MenuItem onClick={() => handleLangSelect("es")}>🇪🇸 Español</MenuItem>
<MenuItem onClick={() => handleLangSelect("en")}>🇬🇧 English</MenuItem>
<MenuItem onClick={() => handleLangSelect("fr")}>🇫🇷 Français</MenuItem>
<MenuItem onClick={() => handleLangSelect("de")}>🇩🇪 Deutsch</MenuItem>
<MenuItem onClick={() => handleLangSelect("it")}>🇮🇹 Italiano</MenuItem>

      </Menu>

      {/* BOTTOM NAV */}
      <Box sx={{ position: "fixed", bottom: 0, width: "100%", zIndex: 1200 }}>
        <BottomNavigation
          value={activeBottomIndex}
          showLabels
          onChange={(event, newValue) => {
            const item = bottomMenu[newValue];
            if (item?.path) navigate(item.path);
          }}
          sx={{ bgcolor: "white" }}
        >
          {bottomMenu.map((item) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              sx={{
                touchAction: "manipulation",
                "&:hover": { bgcolor: "black", color: "white" },
                "&:hover .MuiBottomNavigationAction-label": { color: "white" },
              }}
            />
          ))}
        </BottomNavigation>
      </Box>

      {/* SNACKBAR FAKE */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="info" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
