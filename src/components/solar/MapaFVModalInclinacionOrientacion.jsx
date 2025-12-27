import React, { useRef, useState, useEffect } from "react";
import { Card, Typography, Grid, Dialog, DialogContent } from "@mui/material";

const SolarPanelRadialInlinacionOrienacion = ({
  orientation: initialOrientation = 0,
  inclination: initialInclination = 30,
  onChange
}) => {
  const canvasRef = useRef(null);
  const inclinationRef = useRef(null);

  const [canvasSize, setCanvasSize] = useState(240);
  const [orientation, setOrientation] = useState(Number(initialOrientation));
  const [inclination, setInclination] = useState(
    Math.min(Math.max(Number(initialInclination), 0), 90)
  );

  const [dragOrientation, setDragOrientation] = useState(false);
  const [dragInclination, setDragInclination] = useState(false);

  // Sincronizar props externas cuando cambian
  useEffect(() => {
    setOrientation(Number(initialOrientation));
    setInclination(Math.min(Math.max(Number(initialInclination), 0), 90));
  }, [initialOrientation, initialInclination]);

  // Canvas responsive según ancho del modal/pantalla
  useEffect(() => {
    const resize = () => {
      const modalMaxWidth = Math.min(window.innerWidth * 0.9, 500); // ancho máximo modal
      const size = Math.min(modalMaxWidth * 0.9, 300); // canvas ocupa 90% del modal
      setCanvasSize(size);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Reportar cambios hacia el padre
  useEffect(() => {
    if (onChange) {
      onChange(Math.round(orientation), Math.round(inclination));
    }
  }, [orientation, inclination]);

  // Obtener posición del cursor
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  };

  const drawArrow = (ctx, x0, y0, x1, y1, size = 20) => {
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - size * Math.cos(ang - Math.PI / 6), y1 - size * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(x1 - size * Math.cos(ang + Math.PI / 6), y1 - size * Math.sin(ang + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  // Dibujo orientación
  const drawOrientation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const S = canvasSize;
    const c = S / 2;
    const r = c - 30;

    ctx.clearRect(0, 0, S, S);

    // ejes
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c, 10);
    ctx.lineTo(c, S - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, c);
    ctx.lineTo(S - 10, c);
    ctx.stroke();

    // letras cardinales
    ctx.fillStyle = "#000";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", c, 18);
    ctx.fillText("S", c, S - 18);
    ctx.fillText("E", S - 18, c);
    ctx.fillText("O", 18, c);

    // vector
    const ang = -(orientation * Math.PI) / 180;
    const x1 = c + r * Math.sin(ang);
    const y1 = c + r * Math.cos(ang);

    ctx.lineWidth = 180;
    ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    drawArrow(ctx, c, c, x1, y1);

    // arco orientación
    const arcR = 40;
    const start = Math.PI / 2;
    let end = start + (orientation * Math.PI) / 180;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c, c, arcR, start, end, end < start);
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Arial";
    ctx.textBaseline = "bottom";
    ctx.fillText(`α = ${Math.round(orientation)}°`, c, 111);
  };

  // Dibujo inclinación
  const drawInclination = () => {
    const canvas = inclinationRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const S = canvasSize;
    const c = S / 2;
    const r = c - 25;

    ctx.clearRect(0, 0, S, S);

    // ejes
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c - r, c);
    ctx.lineTo(c + r, c);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c, c - r);
    ctx.lineTo(c, c + r);
    ctx.stroke();

    // arco inclinación
    const start = Math.PI;
    const end = start + (inclination / 90) * (Math.PI / 2);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c, c, r, start, end);
    ctx.stroke();

    // vector
    const x1 = c + r * Math.cos(end);
    const y1 = c + r * Math.sin(end);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    drawArrow(ctx, c, c, x1, y1);

    ctx.fillStyle = "#000";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`β = ${Math.round(inclination)}°`, c + r * 0.35, c + r * 0.45);
  };

  // Drag orientación
  const handleStartOrientation = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const { x, y } = getPos(e, canvas);

    const c = canvasSize / 2;
    const r = c - 30;

    const x0 = c,
      y0 = c;
    const x1 = c + r * Math.sin(-(orientation * Math.PI) / 180);
    const y1 = c + r * Math.cos(-(orientation * Math.PI) / 180);

    const A = x - x0;
    const B = y - y0;
    const C = x1 - x0;
    const D = y1 - y0;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const t = Math.max(0, Math.min(1, dot / lenSq));
    const projX = x0 + t * C;
    const projY = y0 + t * D;
    const dist = Math.hypot(x - projX, y - projY);

    if (dist < 22) setDragOrientation(true);
  };

  const handleMoveOrientation = (e) => {
    if (!dragOrientation) return;
    e.preventDefault();
    const { x, y } = getPos(e, canvasRef.current);
    const c = canvasSize / 2;

    let ang = -Math.atan2(x - c, y - c) * (180 / Math.PI);
    if (ang <= -180) ang += 360;
    if (ang > 180) ang -= 360;

    setOrientation(ang);
  };

  const handleEndOrientation = () => setDragOrientation(false);

  // Drag inclinación
  const handleStartInclination = (e) => {
    e.preventDefault();
    const canvas = inclinationRef.current;
    const { x, y } = getPos(e, canvas);

    const c = canvasSize / 2;
    const r = c - 25;
    const angle = Math.PI + (inclination / 90) * (Math.PI / 2);

    const x0 = c;
    const y0 = c;
    const x1 = c + r * Math.cos(angle);
    const y1 = c + r * Math.sin(angle);

    const A = x - x0;
    const B = y - y0;
    const C = x1 - x0;
    const D = y1 - y0;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const t = Math.max(0, Math.min(1, dot / lenSq));
    const projX = x0 + t * C;
    const projY = y0 + t * D;
    const dist = Math.hypot(x - projX, y - projY);

    if (dist < 22) setDragInclination(true);
  };

  const handleMoveInclination = (e) => {
    if (!dragInclination) return;
    e.preventDefault();
    const { x, y } = getPos(e, inclinationRef.current);
    const c = canvasSize / 2;

    let angle = Math.atan2(y - c, x - c);
    if (angle < 0) angle += 2 * Math.PI;
    if (angle < Math.PI) angle = Math.PI;
    if (angle > 1.5 * Math.PI) angle = 1.5 * Math.PI;

    setInclination(((angle - Math.PI) / (Math.PI / 2)) * 90);
  };

  const handleEndInclination = () => setDragInclination(false);

  useEffect(() => {
    drawOrientation();
    drawInclination();
  }, [orientation, inclination, canvasSize]);

  return (
    <Grid container spacing={2}>
      {/* ORIENTACIÓN */}
      <Grid item xs={12} sm={6}>
        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <Typography align="center" variant="h6">Orientación (α)</Typography>
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{
              width: "100%",
              height: "auto",
              maxWidth: canvasSize,
              touchAction: "none",
              cursor: dragOrientation ? "grabbing" : "grab",
              borderRadius: "50%",
              border: "2px solid #ddd",
              display: "block",
              margin: "auto"
            }}
            onMouseDown={handleStartOrientation}
            onMouseMove={handleMoveOrientation}
            onMouseUp={handleEndOrientation}
            onMouseLeave={handleEndOrientation}
            onTouchStart={handleStartOrientation}
            onTouchMove={handleMoveOrientation}
            onTouchEnd={handleEndOrientation}
          />
        </Card>
      </Grid>

      {/* INCLINACIÓN */}
      <Grid item xs={12} sm={6}>
        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <Typography align="center" variant="h6">Inclinación (β)</Typography>
          <canvas
            ref={inclinationRef}
            width={canvasSize}
            height={canvasSize}
            style={{
              width: "100%",
              height: "auto",
              maxWidth: canvasSize,
              touchAction: "none",
              cursor: dragInclination ? "grabbing" : "grab",
              borderRadius: "50%",
              border: "2px solid #ddd",
              display: "block",
              margin: "auto"
            }}
            onMouseDown={handleStartInclination}
            onMouseMove={handleMoveInclination}
            onMouseUp={handleEndInclination}
            onMouseLeave={handleEndInclination}
            onTouchStart={handleStartInclination}
            onTouchMove={handleMoveInclination}
            onTouchEnd={handleEndInclination}
          />
        </Card>
      </Grid>
    </Grid>
  );
};

export default SolarPanelRadialInlinacionOrienacion;
