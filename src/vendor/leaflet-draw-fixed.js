// leaflet-draw (patched to avoid undeclared "type" errors)

import L from "leaflet";

// --- Fix global strict-mode errors wrapping code in a function ---
(function () {

    const global = (typeof window !== "undefined" ? window : this);

    // Copiado desde leaflet-draw original, pero corrigiendo variables sin declarar
    function readableArea(area, isMetric) {
        let type; // <-- FIX: declarar "type"

        if (isMetric) {
            type = "m²";
            if (area > 1000000) {
                type = "km²";
                area = area / 1000000;
            }
        } else {
            type = "ft²";
            if (area > 27878400) {
                type = "mi²";
                area = area / 27878400;
            }
        }

        return `${area.toFixed(2)} ${type}`;
    }

    // Exponer función obligatoria
    global.L.GeometryUtil = global.L.GeometryUtil || {};
    global.L.GeometryUtil.readableArea = readableArea;



    
})();
