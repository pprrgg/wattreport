import React, { useState, useEffect } from "react";
import { Box, Modal, Tabs, Tab, useMediaQuery } from "@mui/material";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";

import MapaModal from "./MapaModal";
import MapaFVModal from "./solar/MapaFVModal";
import JsonEditorModal from "../excelUploaderStorage/JsonEditorModal";
import TableControls from "../excelUploaderStorage/TableControls";
import MenuOptions from "../excelUploaderStorage/MenuOptions";
import LargeTableWarning from "../excelUploaderStorage/LargeTableWarning";

const ExcelUploaderStorage = ({ openx, cerrarModalx, handleRecalculate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [openMapaModal, setOpenMapaModal] = useState(false);
  const [openMapaFVModal, setOpenMapaFVModal] = useState(false);
  const [excelDataFromSession, setExcelDataFromSession] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [localJsonData, setLocalJsonData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [jsonPopup, setJsonPopup] = useState({
    open: false,
    data: null,
    rowIndex: null,
    cellIndex: null,
    sheetName: null,
    storageKey: "excelData",
  });

  const isMobile = useMediaQuery("(max-width: 600px)");

  // 🔵 Mapa centralizado TAB → Modal
  const modalMap = {
    generadorfv: () => setOpenMapaFVModal(true),
    coordenadas: () => setOpenMapaModal(true),
  };

  // Cargar datos desde sessionStorage
  const loadSessionData = () => {
    const sessionData = sessionStorage.getItem("excelData");
    if (sessionData) setExcelDataFromSession(JSON.parse(sessionData));
  };

  useEffect(() => {
    loadSessionData();
  }, [openx, refreshKey]);

  const handleTabChange = (e, newValue) => setActiveTab(newValue);

  const handleCloseFV = () => {
    setOpenMapaFVModal(false);
    refreshParentData(); // recarga desde sessionStorage al cerrar modal FV
  };

  const handleCloseMapaModal = () => {
    setOpenMapaModal(false);
    refreshParentData(); // 🔹 Recarga la tabla con datos actualizados
  };

  // ------- Importar Excel -------
  const handleFileUpload = (file) => {
    if (!file) return;

    sessionStorage.removeItem("excelData");
    setExcelDataFromSession(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetsData = {};

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        });

        const filledSheet = sheet.map((row) =>
          row.map((cell) =>
            cell === null || cell === undefined
              ? " "
              : typeof cell === "string" && !isNaN(cell) && cell.trim() !== ""
              ? Number(cell)
              : cell
          )
        );

        const filteredSheet = filledSheet.filter((row) =>
          row.some((cell) => cell !== "")
        );

        sheetsData[sheetName] = filteredSheet;
      });

      sessionStorage.setItem("excelData", JSON.stringify(sheetsData));
      setExcelDataFromSession(sheetsData);
      setRefreshKey((prev) => prev + 1);
      toast.success("¡Archivo cargado correctamente!");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImportar = () => {
    const ep = JSON.parse(sessionStorage.getItem("selectedFicha") || "null");
    if (!ep || !ep.cod) {
      toast.error(
        "No se encontró el código de referencia para validar el archivo."
      );
      return;
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .xls";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];

      if (!file || !file.name.toLowerCase().includes(ep.cod.toLowerCase())) {
        toast.error(`El archivo debe ser 'WB_${ep.cod}_******** '.`);
        document.body.removeChild(fileInput);
        return;
      }

      handleFileUpload(file);
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  };

  // ------- Exportar Excel -------
  const handleExport = () => {
    const sessionData = JSON.parse(sessionStorage.getItem("excelData") || "{}");
    const wb = XLSX.utils.book_new();

    const convert = (value) => {
      if (!isNaN(value) && value !== null && value !== "") {
        const n = Number(value);
        return isFinite(n) ? n : value;
      }
      return value;
    };

    Object.keys(sessionData).forEach((sheetName) => {
      const sheetData = sessionData[sheetName].map((row) =>
        row.map((cell) => convert(cell))
      );
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const ep = JSON.parse(sessionStorage.getItem("selectedFicha") || "null");
    const formattedDate = new Date().toISOString().slice(0, 10);
    const fileName = `IT_${ep?.cod || "Export"}_${formattedDate}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  // ------- JSON Editor -------
  const handleSaveJson = () => {
    const sessionData = JSON.parse(sessionStorage.getItem("excelData"));
    const newSessionData = { ...sessionData };
    const sheetData = [...newSessionData[jsonPopup.sheetName]];

    const originalData = sheetData[jsonPopup.rowIndex + 1][jsonPopup.cellIndex];
    let originalJson;

    try {
      originalJson =
        typeof originalData === "string"
          ? JSON.parse(originalData)
          : originalData;
    } catch {
      originalJson = {};
    }

    const updatedJson = {};
    Object.keys(originalJson).forEach((key) => {
      updatedJson[key] =
        localJsonData[key] !== undefined
          ? localJsonData[key]
          : originalJson[key];
    });

    sheetData[jsonPopup.rowIndex + 1][jsonPopup.cellIndex] =
      JSON.stringify(updatedJson);
    newSessionData[jsonPopup.sheetName] = sheetData;

    sessionStorage.setItem("excelData", JSON.stringify(newSessionData));
    setExcelDataFromSession(newSessionData);
    setJsonPopup({ ...jsonPopup, open: false, data: updatedJson });
    setRefreshKey((prev) => prev + 1);
  };

  const refreshParentData = () => {
    const updated = JSON.parse(sessionStorage.getItem("excelData"));
    setExcelDataFromSession(updated);
    setRefreshKey((prev) => prev + 1);
  };

  // ======================================================================================
  // RENDER
  // ======================================================================================

  return (
    <>
      <Modal
        open={openx}
        onClose={cerrarModalx}
        slotProps={{ backdrop: { sx: { backgroundColor: "transparent" } } }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "55px", // altura navbar superior
            left: 0,
            width: "100vw",
            height: "calc(100vh - 64px - 58px)", // resta topbar + bottombar
            bgcolor: "background.paper",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            pb: "58px", // 🔥 deja espacio libre para que no tape el scroll
          }}
        >
          <MenuOptions
            isMobile={isMobile}
            handleImportar={handleImportar}
            handleExport={handleExport}
            handleRecalculate={handleRecalculate}
            handleClose={cerrarModalx}
          />

          {excelDataFromSession && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
              }}
            >
              {/* ---------- TABS ---------- */}
              <Box
                sx={{
                  overflowX: "auto", // permite scroll horizontal
                  borderBottom: 1,
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 55,
                    "& .MuiTabs-flexContainer": {
                      justifyContent: "flex-start", // evita que se centre y se corten
                    },
                    "& .MuiTab-root": {
                      minHeight: 55,
                      minWidth: 120, // ancho mínimo para que se vea completo el texto
                      fontSize: "0.85rem",
                      px: 1.5,
                      py: 2,
                    },
                  }}
                >
                  {Object.keys(excelDataFromSession).map((sheet, index) => (
                    <Tab
                      key={index}
                      label={
                        sheet.length > 15
                          ? sheet.substring(0, 12) + "..."
                          : sheet
                      }
                    />
                  ))}
                </Tabs>
              </Box>

              {/* ---------- TAB CONTENT + CLICK HANDLER A MODALES ---------- */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  p: 0.5,
                  cursor: (() => {
                    const sheetNames = Object.keys(excelDataFromSession);
                    const activeSheet = sheetNames[activeTab]?.toLowerCase();
                    return modalMap[activeSheet] ? "pointer" : "default";
                  })(),
                }}
                onClick={() => {
                  const sheetNames = Object.keys(excelDataFromSession);
                  const activeSheet = sheetNames[activeTab]?.toLowerCase();

                  if (modalMap[activeSheet]) {
                    modalMap[activeSheet](); // Abrir modal correspondiente
                  }
                }}
              >
                {(() => {
                  const sheetNames = Object.keys(excelDataFromSession);
                  const activeSheet = sheetNames[activeTab];
                  const data = excelDataFromSession[activeSheet] || [];
                  const columns = data[0]?.map((_, i) => `C${i + 1}`) || [];
                  const isTooLargeSheet = data.length > 100;

                  if (isTooLargeSheet) {
                    return (
                      <LargeTableWarning
                        columns={columns}
                        data={data.slice(0, 3)}
                        isMobile={true}
                      />
                    );
                  }

                  return (
                    <Box
                      sx={{
                        width: "100%",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* CONTENEDOR GENERAL */}
                      <Box sx={{ width: "100%", overflow: "hidden" }}>
                        {/* CONTROLES (NO TIENEN SCROLL HORIZONTAL) */}
                        <TableControls
                          activeSheet={activeSheet}
                          editingCell={editingCell}
                          setEditingCell={setEditingCell}
                          handleOpenJsonPopup={(
                            jsonData,
                            rowIndex,
                            cellIndex
                          ) => {
                            setLocalJsonData(jsonData);
                            setJsonPopup({
                              open: true,
                              data: jsonData,
                              rowIndex,
                              cellIndex,
                              sheetName: activeSheet,
                              storageKey: "excelData",
                            });
                          }}
                          jsonPopup={jsonPopup}
                          setJsonPopup={setJsonPopup}
                          refreshData={refreshKey}
                          isMobile={true}
                          containerWidth="100%"
                          forceMobileLayout={true}
                        />

                        {/* SCROLL HORIZONTAL SOLO PARA LA TABLA */}
                        <Box
                          sx={{
                            width: "100%",
                            overflowX: "auto",
                            overflowY: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Box
                            sx={{
                              display: "inline-block",
                              minWidth: `${columns.length * 140}px`, // ↔ ancho dinámico
                              border: "2px solid #e0e0e0",
                              borderRadius: "8px",
                              backgroundColor: "background.paper",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            {/* AQUÍ DENTRO VA LA TABLA REAL */}
                            {/** Tu tabla real proviene de TableControls, así que ajusta tu componente para
            que exponga 'tableContent' o recorta solo la tabla aquí */}

                            {data.length > 6 && (
                              <Box
                                sx={{
                                  textAlign: "center",
                                  py: 0.5,
                                  color: "text.secondary",
                                  fontSize: "0.7rem",
                                }}
                              >
                                ⬅️ Desliza para ver más columnas ➡️
                              </Box>
                            )}

                            <Box
                              sx={{
                                px: 1,
                                py: 0.5,
                                backgroundColor: "primary.light",
                                color: "white",
                                fontSize: "0.7rem",
                                textAlign: "center",
                              }}
                            >
                              {data.length} filas • {columns.length} columnas
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* ---------- MODALES ---------- */}

      <JsonEditorModal
        jsonPopup={jsonPopup}
        setJsonPopup={setJsonPopup}
        localJsonData={localJsonData}
        setLocalJsonData={setLocalJsonData}
        handleSaveJson={handleSaveJson}
        refreshParentData={refreshParentData}
      />

      <MapaModal open={openMapaModal} cerrarModal={handleCloseMapaModal} />

      <MapaFVModal open={openMapaFVModal} cerrarModal={handleCloseFV} />
    </>
  );
};

export default ExcelUploaderStorage;
