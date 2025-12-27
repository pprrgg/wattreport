import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import {
  Calculate as CalculateIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Map as MapIcon,
  Close as CloseIcon,
  SolarPower as SolarPowerIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";

const fuchsiaColor = "#D100D1";

const BottomMenuResponsive = ({
  handleImportar,
  handleExport,
  handleRecalculate,
  handleClose,
}) => {
  const location = useLocation();
  const [value, setValue] = useState(0);
  const [hasCoords, setHasCoords] = useState(false);
  const [hasFV, setHasFV] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem("excelData"));
      setHasCoords(
        data?.Coordenadas !== undefined && data?.Coordenadas !== null
      );
      setHasFV(data?.generadorFV !== undefined && data?.generadorFV !== null); // 👈 validar generadorFV
    } catch (e) {
      setHasCoords(false);
      setHasFV(false);
    }
  }, []);

  const menuOptions = [
    { label: "Importar", icon: <CloudUploadIcon />, onClick: handleImportar },
    { label: "Exportar", icon: <CloudDownloadIcon />, onClick: handleExport },

    {
      label: "Simular",
      icon: <SettingsIcon />,
      onClick: handleRecalculate,
    },
    { label: "Cerrar", icon: <CloseIcon />, onClick: handleClose },
  ];

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
        menuOptions[newValue]?.onClick();
      }}
      showLabels
      sx={{
        width: "100%",
        position: "fixed",
        bottom: 0,
        bgcolor: "#fff",
        borderTop: "1px solid #ddd",
        zIndex: 2000,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {menuOptions.map(({ label, icon }, index) => (
        <BottomNavigationAction
          key={label}
          label={label}
          icon={icon}
          sx={{
            color: value === index ? fuchsiaColor : "gray",
            "&.Mui-selected": { color: fuchsiaColor },

            // Hover negativo
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
      ))}
    </BottomNavigation>
  );
};

export default BottomMenuResponsive;
