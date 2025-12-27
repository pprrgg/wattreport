import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const fuchsiaColor = "#D100D1";

const FooterResponsive = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  return (
    <div>
      {/* Footer estilo app móvil */}
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        sx={{
          width: '100%',
          position: 'fixed',
          bottom: 0,
          bgcolor: 'white',
          borderTop: '1px solid #ddd',
          zIndex: 300,
        }}
        showLabels
      >
        <BottomNavigationAction
          label="Blog"
          icon={<SearchIcon />}
          onClick={() => navigate('/Blog')}
          sx={{
            cursor: "pointer",
            pointerEvents: "auto",

            color: value === 0 ? fuchsiaColor : "gray",
            '&.Mui-selected': { color: fuchsiaColor },

            // Mostrar siempre el label
            '& .MuiBottomNavigationAction-label': {
              opacity: 1,
              transition: 'none',
            },
            '&.Mui-selected .MuiBottomNavigationAction-label': {
              opacity: 1,
            },

            // HOVER NEGATIVO -> reglas más específicas y con !important para evitar overrides
            '&:hover, &.Mui-focusVisible': {
              backgroundColor: 'black !important',
              color: 'white !important',
            },
            '&:hover .MuiBottomNavigationAction-label, &.Mui-focusVisible .MuiBottomNavigationAction-label': {
              color: 'white !important',
            },
            '&:hover .MuiSvgIcon-root, &.Mui-focusVisible .MuiSvgIcon-root': {
              color: 'white !important',
            },

            // Asegura que el svg acepte clics
            '& svg': {
              pointerEvents: 'auto',
            },

            // En algunos temas MUI aplica fill en svg — forzamos también el fill
            '& .MuiSvgIcon-root': {
              fill: 'currentColor', // para que tome el color definido arriba
            },
          }}
        />
      </BottomNavigation>
    </div>
  );
};

export default FooterResponsive;
