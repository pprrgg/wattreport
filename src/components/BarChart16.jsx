import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import dragDataPlugin from "chartjs-plugin-dragdata";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  dragDataPlugin
);

// Plugin para dibujar curvas cuadráticas (orden 2)
const createQuadraticSplinePlugin = (arcos) => ({
  id: "quadraticSplinePlugin",
  afterDraw: (chart) => {
    const { ctx, scales } = chart;
    const xScale = scales.x;
    const yScale = scales.y;

    ctx.save();

    arcos.forEach((arco) => {
      const points = arco.points.map(p => ({
        x: xScale.getPixelForValue(p.x),
        y: yScale.getPixelForValue(p.y)
      }));

      if (points.length > 0) {
        ctx.beginPath();
        ctx.lineWidth = arco.lineWidth || 2;
        ctx.strokeStyle = arco.color || "red";
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
          const cpX = (points[i].x + points[i + 1].x) / 2;
          const cpY = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, cpX, cpY);
        }

        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
      }
    });

    ctx.restore();
  }
});

export default function BarChartTransparent() {
  const labels = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];

  const defaultData = {
    labels: labels,
    datasets: [
      {
        label: "Valor",
        data: Array(16).fill(10),
        backgroundColor: "rgba(25,118,210,0.7)"
      }
    ]
  };

  const loadFromSession = () => {
    const saved = sessionStorage.getItem("bar16Data");
    return saved ? JSON.parse(saved) : defaultData;
  };

  const [chartData, setChartData] = useState(loadFromSession);

  useEffect(() => {
    sessionStorage.setItem("bar16Data", JSON.stringify(chartData));
  }, [chartData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    plugins: {
      legend: { labels: { color: "#333" } },
      dragData: {
        showTooltip: true,
        round: 0,
        onDragEnd: (e, datasetIndex, index, value) => {
          const newData = { ...chartData };
          newData.datasets[datasetIndex].data[index] = Math.max(0, Math.min(90, value));
          setChartData(newData);
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#333" },
        grid: { color: "rgba(0,0,0,0.2)" },
        border: { color: "#333" }
      },
      y: {
        min: 0,
        max: 80,
        ticks: { color: "#333", stepSize: 10 },
        grid: { color: "rgba(0,0,0,0.2)" },
        border: { color: "#333" }
      }
    }
  };

  // --- Arcos definidos con pares x,y ---
  const arco1 = {
    color: "red",
    lineWidth: 2,
    points: [
      { x: "N", y: 0 },
      { x: "NE", y: 33 },
      { x: "E", y: 55 },
      { x: "SE", y: 70 },
      { x: "S", y: 77 },
      { x: "SW", y: 70 },
      { x: "W", y: 55 },
      { x: "NW", y: 33 },
      { x: "NNW", y: 15 }
    ]
  };

  const arco2 = {
    color: "green",
    lineWidth: 2,
    points: [
      { x: "N", y: 0 },
      { x: "NE", y: 0 },
      { x: "E", y: 0 },
      { x: "SE", y: 18 },
      { x: "S", y: 25 },
      { x: "SW", y: 18 },
      { x: "W", y: 0 },
      { x: "NW", y: 0 },
      { x: "NNW", y: 0 }
    ]
  };

  const quadraticSplinePlugin = createQuadraticSplinePlugin([arco1, arco2]);

  return (
    <div style={{ width: "100%", height: "250px", background: "transparent" }}>
      <Bar
        data={chartData}
        options={options}
        plugins={[quadraticSplinePlugin]}
        style={{ backgroundColor: "transparent" }} // canvas transparente
      />
    </div>
  );
}
