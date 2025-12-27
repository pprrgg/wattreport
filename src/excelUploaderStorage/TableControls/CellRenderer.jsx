import React, { useState, useRef, useEffect } from "react";
import {
  Checkbox,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMapEvents,
  useMap,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../../vendor/leaflet-draw-fixed.js";
import ShadowProfileChart from "./ShadowProfileChart";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Editors from "./Editors";
import "leaflet-draw";

// ==========================
// SOMBRAS WRAPPER
// ==========================
export const SombrasWrapper = ({ value, saveValue }) => {
  const [open, setOpen] = useState(false);
  const parsed = parseJSONSafe(value) || {};
  const key = Object.keys(parsed)[0];
  const data = parsed[key] || [];
  const [nivelSombra16, setNivelSombra16] = useState([]);

  useEffect(() => {
    if (!open) return;
    setNivelSombra16(data.map((p) => p[1]));
  }, [open, value]);

  const guardarCambios = (newValues) => {
    const reconstruido = data.map((p, i) => [p[0], newValues[i]]);
    saveValue(JSON.stringify({ sombras: reconstruido }));
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="small"
        sx={{ minWidth: 32, width: "100%", padding: "4px 0" }}
      >
        <EditIcon />
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Perfil de sombra</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <ShadowProfileChart
            nivelSombra16={nivelSombra16}
            setNivelSombra16={(val) => {
              setNivelSombra16(val);
              guardarCambios(val);
            }}
          />
          <Button
            onClick={() => setOpen(false)}
            variant="contained"
            sx={{ mt: 2 }}
            fullWidth
          >
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ==========================
// ICONOS LEAFLET
// ==========================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ==========================
// DETECTAR TIPO DE CELDA
// ==========================
const detectCellType = (value) => {
  if (value == null) return "empty";
  const v = String(value).trim();
  if (v.startsWith("{") && v.endsWith("}")) return "json";
  if (/^(true|false)(;(true|false))*$/i.test(v)) return "boolList";
  if (v.includes(";")) return "stringList";
  if (v.startsWith("!")) return "command";
  if (!isNaN(Number(v))) return "number";
  return "text";
};
const EDITABLE_TYPES = new Set([
  "number",
  "command",
  "boolList",
  "stringList",
  "json", // solo si quieres permitir botones/modales
]);
// ==========================
// PARSEO DE JSON CON NORMALIZACION
// ==========================
const parseJSONSafe = (value) => {
  try {
    const normalized =
      typeof value === "string"
        ? value.replace(/'/g, '"').replace(/(\w+):/g, '"$1":')
        : value;
    return JSON.parse(normalized);
  } catch {
    return null;
  }
};

// ==========================
// JSON LIST EDITOR
// ==========================
const JsonListEditor = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [editedList, setEditedList] = useState([]);

  const parsed = parseJSONSafe(value);
  if (!parsed) return <div style={{ color: "red" }}>JSON inválido</div>;

  const key = Object.keys(parsed)[0];
  const list = Array.isArray(parsed[key])
    ? Array.isArray(parsed[key][0])
      ? parsed[key][0]
      : parsed[key]
    : [];

  const handleOpenModal = () => {
    setEditedList(list.map((pair) => [...pair]));
    setOpen(true);
  };

  const handleChangeItem = (index, newValue) => {
    const newList = [...editedList];
    newList[index][1] = Number(newValue);
    setEditedList(newList);
    updateParent(newList);
  };

  const updateParent = (newList) => {
    const updated = { ...parsed };
    updated[key] = Array.isArray(parsed[key][0]) ? [newList] : newList;
    onChange(JSON.stringify(updated));
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        size="small"
        sx={{ minWidth: 32, width: "100%", padding: "4px 0" }}
      >
        <EditIcon />
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar {key}</DialogTitle>
        <DialogContent>
          {editedList.map((item, idx) => (
            <TextField
              key={idx}
              label={item[0]}
              fullWidth
              margin="dense"
              type="number"
              value={item[1]}
              onChange={(e) => handleChangeItem(idx, e.target.value)}
            />
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
};

// ==========================
// MAP CLICK HANDLER
// ==========================
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
};

// ==========================
// CAPAS BASE DEL MAPA
// ==========================
// const baseLayers = {
//   Mapa: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "© OpenStreetMap contributors",
//   }),
//   Satelite: L.tileLayer(
//     "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//     { attribution: "Tiles © Esri" }
//   ),
// };

// ==========================
// COORDINATES EDITOR
// ==========================
const CoordinatesEditor = ({ position, setPosition, saveValue, keyName }) => {
  const handleMapClick = (latlng) => {
    const newPos = [latlng.lat, latlng.lng];
    setPosition(newPos);
    saveValue(
      JSON.stringify({
        [keyName]: [
          ["lat", newPos[0]],
          ["lon", newPos[1]],
        ],
      })
    );
  };

  const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center);
    }, [center, map]);
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={18} // 18 → seguro
      maxZoom={19} // <—— muy importante
      style={{ height: 420, width: "100%" }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Satélite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="OSM">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <MapClickHandler onMapClick={handleMapClick} />
      <Marker position={position} />
      <RecenterMap center={position} />
    </MapContainer>
  );
};

// ==========================
// POLYGON EDITOR
// ==========================

const PolygonEditor = ({ polygon, setPolygon, saveValue, keyName }) => {
  const mapRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const compassRef = useRef(null);

  const DEFAULT_CENTER = [36.66417, -4.45865];
  const DEFAULT_ZOOM = 19;

  const handleMapReady = (map) => {
    mapRef.current = map;

    if (!drawnItemsRef.current) {
      drawnItemsRef.current = new L.FeatureGroup();
    }

    const drawnItems = drawnItemsRef.current;

    if (!map.hasLayer(drawnItems)) {
      map.addLayer(drawnItems);
    }

    drawnItems.clearLayers();

    const baseLayers = {
      Satelite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri", maxZoom: 23 }
      ),
      Mapa: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 23,
      }),
    };

    baseLayers["Satelite"].addTo(map);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: { color: "#ff0000" },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });

    map.addControl(drawControl);
  };

  // ==========================
  // Renderizar polígono
  // ==========================
  useEffect(() => {
    const map = mapRef.current;
    const drawnItems = drawnItemsRef.current;
    if (!map || !drawnItems) return;

    drawnItems.clearLayers();

    if (polygon.length > 0) {
      const poly = L.polygon(polygon, { color: "#ff0000" });
      drawnItems.addLayer(poly);

      map.fitBounds(poly.getBounds(), {
        padding: [120, 120],
        maxZoom: 22,
      });
    }
  }, [polygon]);

  // ==========================
  // Eventos Leaflet Draw
  // ==========================
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const drawnItems = drawnItemsRef.current;

    const updatePolygon = (layer) => {
      const latlngs = layer.getLatLngs()[0].map((p) => [p.lat, p.lng]);

      setPolygon(latlngs);
      saveValue(JSON.stringify({ [keyName]: [latlngs] }));
    };

    const onCreated = (e) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);

      updatePolygon(e.layer);

      map.fitBounds(e.layer.getBounds(), {
        padding: [120, 120],
        maxZoom: 22,
      });
    };

    const onEdited = (e) => {
      e.layers.eachLayer(updatePolygon);

      const bounds = drawnItems.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [120, 120],
          maxZoom: 22,
        });
      }
    };

    // ✅ AQUÍ ESTÁ LA CLAVE
    const onDeleted = () => {
      drawnItems.clearLayers();

      if (compassRef.current) {
        map.removeLayer(compassRef.current);
        compassRef.current = null;
      }

      setPolygon([]);
      saveValue(JSON.stringify({ [keyName]: [[]] }));

      // ❌ NO setView → mantiene última vista
    };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: 560,
        position: "relative",
      }}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={6}
        maxZoom={20}
        style={{ width: "100%", height: "100%" }}
        whenReady={(e) => handleMapReady(e.target)}
        zoomControl
        scrollWheelZoom
      >
        <style>{`
          .leaflet-marker-icon.leaflet-div-icon {
            width: 6px !important;
            height: 6px !important;
            margin-left: -6px !important;
            margin-top: -6px !important;
            border-radius: 6px !important;
            border: 2px solid #fff !important;
            background: #3388ff !important;
          }

          .leaflet-interactive {
            stroke-width: 3px !important;
          }
        `}</style>
      </MapContainer>
    </div>
  );
};

// ==========================
// MAP EDITOR WRAPPER
// ==========================
const MapEditorWrapper = ({ open, onClose, value, saveValue }) => {
  const parsed = parseJSONSafe(value) || {};
  const key = Object.keys(parsed)[0];
  const data = parsed[key];

  const [position, setPosition] = useState([0, 0]);
  const [polygon, setPolygon] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (key === "coordenadas") {
      const lat = data.find((c) => c[0] === "lat")?.[1] || 0;
      const lon = data.find((c) => c[0] === "lon")?.[1] || 0;
      setPosition([lat, lon]);
    } else if (key === "superficie" && Array.isArray(data[0])) {
      setPolygon(data[0].map((p) => [p[0], p[1]]));
    }
  }, [open, value]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Editar {key}</DialogTitle>
      <DialogContent>
        <div
          style={{ height: key === "superficie" ? 560 : 420, width: "100%" }}
        >
          {key === "coordenadas" ? (
            <CoordinatesEditor
              position={position}
              setPosition={setPosition}
              saveValue={saveValue}
              keyName={key}
            />
          ) : (
            <PolygonEditor
              polygon={polygon}
              setPolygon={setPolygon}
              saveValue={saveValue}
              keyName={key}
            />
          )}
        </div>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "grey.700",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};

// ==========================
// MAP WRAPPER BOTÓN
// ==========================
export const MapWrapper = ({ value, saveValue }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="small"
        sx={{ minWidth: 32, width: "100%", padding: "4px 0" }}
      >
        <EditIcon />
      </Button>
      <MapEditorWrapper
        open={open}
        onClose={() => setOpen(false)}
        value={value}
        saveValue={saveValue}
      />
    </>
  );
};

// ==========================
// HANDLERS CELDA
// ==========================
const cellHandlers = {
  json: {
    view: ({ value, saveValue }) => {
      const parsed = parseJSONSafe(value);
      if (!parsed) return <div style={{ color: "red" }}>JSON inválido</div>;
      const key = Object.keys(parsed)[0];
      if (key === "coordenadas" || key === "superficie")
        return <MapWrapper value={value} saveValue={saveValue} />;

      if (key === "sombras")
        return <SombrasWrapper value={value} saveValue={saveValue} />;

      return <JsonListEditor value={value} onChange={saveValue} />;
    },
  },
  boolList: {
    view: ({ value, editable, onChange }) => {
      const checked = value.split(";")[0].toLowerCase() === "true";
      return (
        <Checkbox
          checked={checked}
          disabled={!editable}
          onChange={(e) =>
            onChange(e.target.checked ? "true;false" : "false;true")
          }
        />
      );
    },
  },
  stringList: {
    view: ({ value, editable, onChange }) => {
      const options = value.split(";").map((s) => s.trim());
      const selected = options[0];
      if (!editable) return <div style={{ color: "gray" }}>{selected}</div>;
      return (
        <Select
          value={selected}
          onChange={(e) =>
            onChange(
              [
                e.target.value,
                ...options.filter((o) => o !== e.target.value),
              ].join(";")
            )
          }
          size="small"
          sx={{ width: "100%" }}
        >
          {options.map((o, i) => (
            <MenuItem key={i} value={o}>
              {o}
            </MenuItem>
          ))}
        </Select>
      );
    },
  },
  command: {
    view: ({ value, startEditing }) => (
      <div onClick={startEditing} style={{ padding: 8, cursor: "pointer" }}>
        {value.substring(1)}
      </div>
    ),
    beforeEdit: (v) => v.substring(1),
  },
  number: {
    view: ({ value, startEditing }) => (
      <div onClick={startEditing} style={{ padding: 8, cursor: "pointer" }}>
        {value}
      </div>
    ),
    save: Number,
  },
  text: {
    view: ({ value }) => (
      <div
        style={{
          padding: 8,
          whiteSpace: "normal",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          lineHeight: 1.4,
        }}
      >
        {value}
      </div>
    ),
  },

  empty: { view: () => <div /> },
};

// ==========================
// CELL RENDERER
// ==========================
const CellRenderer = ({
  activeSheet,
  rowIndex,
  cellIndex,
  dataFromSession,
  editingCell,
  setEditingCell,
  updateSessionData,
}) => {
  const [editingValue, setEditingValue] = useState("");
  const sheet = dataFromSession[activeSheet];
  const editableSheet = !!activeSheet;

  const getValue = () => sheet?.[rowIndex + 1]?.[cellIndex] ?? null;
  const saveValue = (newValue) => {
    const updated = { ...dataFromSession };
    updated[activeSheet][rowIndex + 1][cellIndex] = newValue;
    updateSessionData(updated);
  };

  const startEditing = () => {
    if (!editableSheet) return;
    const value = getValue();
    const type = detectCellType(value);

    // ⛔ texto libre NO editable
    if (!EDITABLE_TYPES.has(type)) return;

    const handler = cellHandlers[type];
    setEditingValue(handler?.beforeEdit ? handler.beforeEdit(value) : value);
    setEditingCell({ row: rowIndex, cell: cellIndex });
  };

  const commitEditing = () => {
    const original = getValue();
    const type = detectCellType(original);
    const handler = cellHandlers[type];
    let newVal = handler?.save ? handler.save(editingValue) : editingValue;
    if (String(original).startsWith("!")) newVal = "!" + newVal;
    saveValue(newVal);
    setEditingCell(null);
  };

  const value = getValue();
  const type = detectCellType(value);
  const handler = cellHandlers[type];

  if (editingCell?.row === rowIndex && editingCell.cell === cellIndex) {
    return (
      <div style={{ padding: 0, width: "100%", boxSizing: "border-box" }}>
        <Editors
          cellValue={value}
          editingValue={editingValue}
          setEditingValue={setEditingValue}
          saveEditing={commitEditing}
          setEditingCell={setEditingCell}
          isSheetEditable={editableSheet}
        />
      </div>
    );
  }

  return handler.view({
    value,
    editable: editableSheet,
    onChange: saveValue,
    startEditing,
    saveValue,
  });
};

export default CellRenderer;
