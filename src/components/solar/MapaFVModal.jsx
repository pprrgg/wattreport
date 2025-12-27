// MapaFVModal.jsx

import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import {
  Card, CardContent, Grid, Typography, Modal,
  Box,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';


import CloseIcon from '@mui/icons-material/Close';
import SolarPanelRadial from './MapaFVModalInclinacionOrientacion';
import ShadowProfileChart from './MapaFVModalShadow';

/* =============================================================
   ESTILOS LEAFLET PARA REDUCIR TAMAÑO DE VÉRTICES
   ============================================================= */
const estilosVerticesPequeños = `
.leaflet-marker-icon.leaflet-div-icon { background: white !important; border: 1.5px solid #3388ff !important; width: 8px !important; height: 8px !important; margin-left: -4px !important; margin-top: -4px !important; border-radius: 1px !important; }
.leaflet-marker-icon.leaflet-div-icon.leaflet-draw-tooltip-marker { background: white !important; border: 1.5px solid #3388ff !important; width: 8px !important; height: 8px !important; margin-left: -4px !important; margin-top: -4px !important; }
.leaflet-draw-guide-dash { background: white !important; border: 1.5px solid #3388ff !important; width: 8px !important; height: 8px !important; margin-left: -4px !important; margin-top: -4px !important; border-radius: 1px !important; }
.leaflet-draw-tooltip { font-size: 11px !important; }
.leaflet-marker-draggable { width: 8px !important; height: 8px !important; margin-left: -4px !important; margin-top: -4px !important; background-color: white !important; border: 1.5px solid #3388ff !important; border-radius: 1px !important; }
.leaflet-edit-marker-icon { background-color: white !important; border: 1.5px solid #3388ff !important; width: 7px !important; height: 7px !important; margin-left: -3.5px !important; margin-top: -3.5px !important; border-radius: 1px !important; }
`;

const createSmallIcon = () => {
  return L.divIcon({
    className: 'leaflet-marker-icon leaflet-div-icon',
    iconSize: [8, 8],
    iconAnchor: [4, 4]
  });
};

// Íconos por defecto Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const SESSION_STORAGE_KEY = 'excelData';

const style = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  m: 0,
  zIndex: 1300,
  overflow: 'hidden'
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function MapaFVModal({ open, cerrarModal }) {
  const mapRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const drawControlRef = useRef(null);

  const [selectedLayer, setSelectedLayer] = useState(null);
  const [nivelSombra16, setNivelSombra16] = useState(Array(16).fill(0));
  const [tabIndex, setTabIndex] = useState(0);

  const originalStylesRef = useRef(new Map());

  /* =============================================================
     📌 CAMPOS GENERALES DEL TAB “MONTAJE”
     ============================================================= */
  const CAMPOS_MONTAJE = [
    'modoMontaje',
    'coste_instalacion_unitario',
    'coste_mantenimiento_unitaxxxio',
    'duracion',
    'interes'
  ];

  const [camposMontaje, setCamposMontaje] = useState({
    modoMontaje: 'coplanar',
    coste_instalacion_unitario: 33,
    coste_mantenimiento_unitario: 0,
    duracion: 0,
    interes: 0
  });

  /* =============================================================
     INSERTAR ESTILOS
     ============================================================= */
  useEffect(() => {
    const el = document.createElement('style');
    el.innerHTML = estilosVerticesPequeños;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      const extraStyle = document.createElement('style');
      extraStyle.innerHTML = `
        .leaflet-draw-guide-dash,
        .leaflet-marker-icon.leaflet-div-icon,
        .leaflet-marker-icon.leaflet-div-icon.leaflet-draw-tooltip-marker {
          width: 8px !important;
          height: 8px !important;
          margin-left: -4px !important;
          margin-top: -4px !important;
          background: white !important;
          border: 1.5px solid #3388ff !important;
        }
      `;
      document.head.appendChild(extraStyle);
    }, 500);
  }, [open]);

  /* =============================================================
     SERIALIZACIÓN DE LAYERS
     ============================================================= */
  const serializeLayerCoords = (layer) => {
    if (!layer) return [];
    if (layer.getLatLng && !layer.getLatLngs) {
      const p = layer.getLatLng();
      return [[[p.lat, p.lng]]];
    }
    const latlngs = layer.getLatLngs?.() ?? [];
    const fix = (arr) =>
      arr.map((p) =>
        Array.isArray(p) ? fix(p) : [p.lat, p.lng]
      );
    return fix(latlngs);
  };

  /* =============================================================
     GUARDAR EN SESSION STORAGE
     ============================================================= */
  const guardarSession = () => {
    if (!drawnItemsRef.current) return;

    const matriz = [
      [
        'tipo',
        'latlngs',
        'nivelSombra16',
        'inclinacion',
        'orientacion',
        ...CAMPOS_MONTAJE
      ]
    ];

    drawnItemsRef.current.eachLayer((layer) => {
      const type =
        layer instanceof L.Marker
          ? 'marker'
          : layer instanceof L.Polygon
            ? 'polygon'
            : 'polyline';

      const d = layer._myData || {};
      matriz.push([
        type,
        JSON.stringify(serializeLayerCoords(layer)),
        JSON.stringify(d.nivelSombra || Array(16).fill(0)),
        d.inclinacion ?? 0,
        d.orientacion ?? 0,
        ...CAMPOS_MONTAJE.map((k) => d[k] ?? (k === 'modoMontaje' ? 'coplanar' : 0))
      ]);
    });

    const obj = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}');
    obj.generadorFV = matriz;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(obj));
  };

  /* =============================================================
     MANEJO DE SELECCIÓN POR DBLCLICK
     ============================================================= */
  const asignarClick = (layer) => {
    layer.off('dblclick');
    layer.on('dblclick', () => {
      if (selectedLayer && selectedLayer !== layer) {
        const prev = originalStylesRef.current.get(selectedLayer);
        selectedLayer.setStyle?.(prev);
      }

      if (!originalStylesRef.current.has(layer)) {
        originalStylesRef.current.set(layer, {
          color: layer.options.color,
          fillColor: layer.options.fillColor,
          fillOpacity: layer.options.fillOpacity,
          weight: layer.options.weight
        });
      }

      layer.setStyle?.({ fillColor: 'orange', fillOpacity: 0.4 });

      setSelectedLayer(layer);

      const d = layer._myData || {};

      setNivelSombra16(d.nivelSombra || Array(16).fill(0));

      const vals = {};
      CAMPOS_MONTAJE.forEach(
        (c) =>
          (vals[c] = d[c] ?? (c === 'modoMontaje' ? 'coplanar' : 0))
      );
      setCamposMontaje(vals);

      setTabIndex(0);
    });
  };

  /* =============================================================
     CREACIÓN / EDICIÓN / BORRADO
     ============================================================= */
  const onCrear = (e) => {
    const layer = e.layer;

    layer._myData = {
      nivelSombra: Array(16).fill(0),
      inclinacion: 0,
      orientacion: 0,
      ...Object.fromEntries(
        CAMPOS_MONTAJE.map((c) => [
          c,
          c === 'modoMontaje' ? 'coplanar' : 0
        ])
      )
    };

    drawnItemsRef.current.addLayer(layer);
    asignarClick(layer);
    setSelectedLayer(layer);
    guardarSession();
  };

  const onEditar = () => guardarSession();
  const onEliminar = () => guardarSession();

  /* =============================================================
     RECONSTRUIR DESDE SESSION
     ============================================================= */
  const crearLayerDesdeFila = (row, drawnItems) => {
    try {
      const [type, coordsStr, nivelStr, inc, ori, ...resto] = row;
      const latlngs = JSON.parse(coordsStr);

      let layer =
        type === 'marker'
          ? L.marker([latlngs[0][0][0], latlngs[0][0][1]])
          : type === 'polygon'
            ? L.polygon(latlngs)
            : L.polyline(latlngs);

      const campos = {};
      CAMPOS_MONTAJE.forEach((c, i) => {
        campos[c] =
          resto[i] ?? (c === 'modoMontaje' ? 'coplanar' : 0);
      });

      layer._myData = {
        nivelSombra: JSON.parse(nivelStr),
        inclinacion: Number(inc),
        orientacion: Number(ori),
        ...campos
      };

      drawnItems.addLayer(layer);
      asignarClick(layer);
    } catch (e) {
      console.warn('Error reconstruyendo', e);
    }
  };

  const cargarDesdeSession = (drawnItems, map) => {
    try {
      const obj = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '{}');
      const data = obj.generadorFV || [];

      if (!Array.isArray(data) || data.length < 2) return;

      drawnItems.clearLayers();
      data.slice(1).forEach((fila) =>
        crearLayerDesdeFila(fila, drawnItems)
      );

      const layers = Object.values(drawnItems._layers);
      if (layers.length > 0) {
        map.fitBounds(
          L.featureGroup(layers).getBounds(),
          { maxZoom: 18, padding: [20, 20] }
        );
      }
    } catch (err) {
      console.warn('Error cargando session', err);
    }
  };

  /* =============================================================
     INIT MAP
     ============================================================= */
  const initMap = () => {
    if (mapRef.current) return;

    const map = L.map('map', { maxZoom: 20 }).setView([38, -3], 12);
    mapRef.current = map;

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 20 }
    ).addTo(map);

    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    cargarDesdeSession(drawnItems, map);

    const drawControl = new L.Control.Draw({
      draw: {
        marker: true,
        polyline: true,
        polygon: true,
        rectangle: false,
        circle: true,
        circlemarker: false
      },
      edit: { featureGroup: drawnItems, remove: true }
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, onCrear);
    map.on(L.Draw.Event.EDITED, onEditar);
    map.on(L.Draw.Event.DELETED, onEliminar);
  };

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(initMap)
    );
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        drawnItemsRef.current = null;
      }
    };
  }, [open]);

  /* =============================================================
     ACTUALIZAR SOMBRA
     ============================================================= */
  const actualizarSombra = (x) => {
    setNivelSombra16(x);
    if (selectedLayer) {
      selectedLayer._myData.nivelSombra = x;
      guardarSession();
    }
  };

  /* =============================================================
     RENDER
     ============================================================= */
  return (
    <Modal open={open} onClose={cerrarModal}>
      <Box sx={{ ...style }}>
        <IconButton
          onClick={cerrarModal}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            backgroundColor: 'white',
            zIndex: 2000
          }}>
          <CloseIcon sx={{ color: 'black' }} />
        </IconButton>

        <div
          id="map-wrapper"
          style={{
            width: '80%',
            height: '100%',
            position: 'relative',
            transform: 'scale(1.5)',
            transformOrigin: 'top left'
          }}>
          <div id="map" style={{ width: '100%', height: '100%' }} />
        </div>

        {selectedLayer && (
          <Modal open onClose={() => setSelectedLayer(null)}
            BackdropProps={{ invisible: true }}>
            <Box sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '99vw',
              height: '50vh',
              bgcolor: 'white',
              p: 2,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12
            }}>
              <IconButton onClick={() => setSelectedLayer(null)}
                sx={{ position: 'absolute', top: 8, right: 8 }}>
                <CloseIcon />
              </IconButton>

              <Tabs value={tabIndex}
                onChange={(e, i) => setTabIndex(i)}
                centered>
                <Tab label="Panel" />
                <Tab label="Perfil Obstáculos" />
                <Tab label="Montaje" />
              </Tabs>

              <Box sx={{ flex: 1, mt: 1, overflowY: 'auto' }}>
                {tabIndex === 0 && (
                  <SolarPanelRadial
                    orientation={selectedLayer._myData.orientacion}
                    inclination={selectedLayer._myData.inclinacion}
                    onChange={(ori, inc) => {
                      selectedLayer._myData.orientacion = ori;
                      selectedLayer._myData.inclinacion = inc;
                      guardarSession();
                    }}
                  />
                )}
                {tabIndex === 1 && (
                  <ShadowProfileChart
                    nivelSombra16={nivelSombra16}
                    setNivelSombra16={actualizarSombra}
                    selectedLayer={selectedLayer}
                    guardarEnSessionStorage={guardarSession}
                  />
                )}
                {tabIndex === 2 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      {CAMPOS_MONTAJE.map((campo) => (
                        <Grid
                          item
                          xs={12}   // en pantallas pequeñas ocupa todo (1 columna)
                          sm={6}    // en pantallas >=600px ocupa la mitad (2 columnas)
                          key={campo}
                        >
                          {campo === 'modoMontaje' ? (
                            <FormControl fullWidth size="small">
                              <InputLabel id={`label-${campo}`}>Modo Montaje</InputLabel>
                              <Select
                                labelId={`label-${campo}`}
                                value={camposMontaje[campo]}
                                label="Modo Montaje"
                                size="small"
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setCamposMontaje((p) => ({ ...p, [campo]: v }));
                                  selectedLayer._myData[campo] = v;
                                  guardarSession();
                                }}
                              >
                                <MenuItem value="libre">Libre</MenuItem>
                                <MenuItem value="integrado">Integrado</MenuItem>
                                <MenuItem value="esteOeste">Integrado Este-Oeste</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label={campo.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                              value={camposMontaje[campo]}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setCamposMontaje((p) => ({ ...p, [campo]: v }));
                                selectedLayer._myData[campo] = v;
                                guardarSession();
                              }}
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            </Box>
          </Modal>
        )}
      </Box>
    </Modal>
  );
}
