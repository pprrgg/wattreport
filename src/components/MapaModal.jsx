import React, { useEffect, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  zIndex: 1300,
};

function MapaModal({ open, cerrarModal }) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        if (map) {
          map.remove();
          setMap(null);
        }

        // Capas base
        const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        });

        const osmTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
        });

        // Satélite (ESRI)
        const satellite = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { attribution: 'Tiles © Esri' }
        );

        // Labels híbrido (ESRI)
        const hybridLabels = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { attribution: 'Labels © Esri' }
        );

        // Inicializamos el mapa con el híbrido por defecto (satellite + labels)
        const newMap = L.map(mapContainer, {
          center: [33, -3],
          zoom: 6,
          layers: [satellite, hybridLabels],  // híbrido activado por defecto
        });

        // Control de capas
        const baseLayers = {
          "OSM Standard": osmStandard,
          "OSM Topo": osmTopo,
          "Satélite": satellite,
          "Híbrido": L.layerGroup([satellite, hybridLabels]),  // nueva capa híbrida
        };
        L.control.layers(baseLayers).addTo(newMap);

        let marker = null;
        const excelData = JSON.parse(sessionStorage.getItem('excelData'));

        // Cuando cargas el marcador inicial desde sessionStorage
        if (excelData?.Coordenadas) {
          const lat = excelData.Coordenadas[1][1];
          const lng = excelData.Coordenadas[2][1];
          marker = L.marker([lat, lng])
            .addTo(newMap)
            .bindPopup(`Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .openPopup();

          // Centrar el mapa en el marcador y ajustar el zoom
          newMap.setView([lat, lng], 22);
        }

        // Cuando el usuario hace click
        newMap.on('click', (e) => {
          const { lat, lng } = e.latlng;
          const newExcelData = JSON.parse(sessionStorage.getItem('excelData')) || {};
          newExcelData.Coordenadas = [
            ["Parámetro", "Valor"],
            ["lat", lat],
            ["lng", lng],
          ];
          sessionStorage.setItem('excelData', JSON.stringify(newExcelData));

          if (marker) newMap.removeLayer(marker);

          marker = L.marker([lat, lng])
            .addTo(newMap)
            .bindPopup(`Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .openPopup();

          // Centrar el mapa en el marcador sin cambiar el zoom
          newMap.panTo([lat, lng]);
        });



        setMap(newMap);
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      if (map) {
        map.remove();
        setMap(null);
      }
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={cerrarModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ zIndex: 1300 }}
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={cerrarModal}
          sx={{
            position: 'absolute',
            right: 3,
            top: 3,
            color: 'text.primary',
          }}
        >
          <CloseIcon />
        </IconButton>
        <div id="map" style={{ height: '100%', width: '100%' }}></div>
      </Box>
    </Modal>
  );
}

export default MapaModal;

