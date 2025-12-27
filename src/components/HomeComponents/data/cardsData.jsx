import React from "react";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import BoltIcon from "@mui/icons-material/Bolt";
import GroupsIcon from "@mui/icons-material/Groups";
import VibrationIcon from "@mui/icons-material/Vibration";
import SearchIcon from "@mui/icons-material/Search";
import EvStationIcon from "@mui/icons-material/EvStation";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";

const primaryColor = "darkblue";

export const cardsData = [
  {
    id: 18,
    title_es: "Automatismos Industriales",
    description_es:
      "Sistemas de automatización y control para procesos industriales.",
    full_description_es:
      "Diseño, implementación y mantenimiento de sistemas de automatización industrial incluyendo control de procesos, robótica, SCADA, PLCs y sistemas de supervisión para optimizar la producción industrial.",
    icon: React.createElement(PrecisionManufacturingIcon, { 
      sx: { fontSize: 60, color: primaryColor } 
    }),
    link: "/Docs",
    image: "/img/ai01.png",
    group: "Automatizacion_Industrial",
    sector: "Industria",
    searchtext:
      "automatismos industriales PLC SCADA robótica control procesos",
  },
  {
    id: 14,
    title_es: "Gestión y negociación de contratos de energía",
    description_es:
      "Análisis y gestión de contratos energéticos para reducir costes y maximizar eficiencia.",
    full_description_es:
      "Revisión de tarifas, análisis de consumo histórico, simulación de escenarios y recomendaciones para gestionar y negociar de forma eficiente los contratos de suministro de energía (electricidad y gas) necesarios en la industria, comercio o suministro residencial.",
    icon: React.createElement(BoltIcon, { 
      sx: { fontSize: 60, color: primaryColor } 
    }),
    link: "/Docs",
    image: "/img/Optimización_de_contratos_de_energía.jpeg",
    group: "Optimización_Contratos_Energía",
    sector: "Energía",
    searchtext: "contratos energía optimización ahorro consumo",
  },
  {
    id: 12,
    title_es: "Comunidades Energéticas",
    description_es:
      "Estudio de diseño y viabilidad (técnica, económica y legal), creación y gestión de comunidades ciudadanas de energía y comunidades de energías renovables.",
    full_description_es:
      "Estudio de diseño y viabilidad (técnica, económica y legal), creación y gestión de comunidades ciudadanas de energía y comunidades de energías renovables.",
    icon: React.createElement(GroupsIcon, { 
      sx: { fontSize: 60, color: primaryColor } 
    }),
    link: "/Docs",
    image: "/img/ce01.png",
    group: "Control_Comunidades_Autoconsumo",
    sector: "Energía",
    searchtext: "comunidades energéticas autoconsumo",
  },
  {
    id: 17,
    title_es: "Mantenimiento Preventivo",
    description_es:
      "Monitorización de maquinaria para prevenir fallos y optimizar su vida útil.",
    full_description_es:
      "Sensores, alertas tempranas de desgaste, análisis de rendimiento y reportes automáticos para planificar mantenimientos preventivos y reducir paradas no programadas.",
    icon: React.createElement(VibrationIcon, { 
      sx: { fontSize: 60, color: primaryColor } 
    }),
    link: "/Docs",
    image: "/img/mp01.png",
    group: "Mantenimiento_Vibraciones",
    sector: "Mantenimiento / Industria",
    searchtext: "mantenimiento preventivo vibraciones maquinaria alertas",
  },
  {
    id: 13,
    title_es: "Auditorías Energéticas",
    description_es:
      "Supervisión y validación de auditorías energéticas para optimizar el consumo.",
    full_description_es:
      "Mapeado energético, análisis de consumo, propuesta de mejores energéticas, generación de informes, recomendaciones y seguimiento de medidas de eficiencia energética.",
    icon: React.createElement(SearchIcon, { 
      sx: { fontSize: 60, color: primaryColor } 
    }),
    link: "/Docs",
    image: "/img/ae01.png",
    group: "Control_Auditorias_Energéticas",
    sector: "Eficiencia Energética",
    searchtext: "auditorías energéticas eficiencia control",
  },
  {
    id: 10,
    title_es:
      "Infraestructura de puntos de Recarga para Vehículos Eléctricos (IRVE)",
    description_es:
      "instalación y gestión de soluciones de carga para vehículos eléctricos.",
    full_description_es:
      "Instalación, mantenimiento y gestión de Infraestructura de puntos de Recarga para Vehículos Eléctricos (IRVE). Implementar los puntos de conexión necesarios para suministrar energía a estos vehículos, permitiendo su recarga de forma segura y eficiente supervisión de estaciones de recarga en parkings públicos, comunidades de vecinos y empresas.",
    icon: React.createElement(EvStationIcon, { 
      sx: { fontSize: 60, color: primaryColor } 
    }),
    link: "/Docs",
    image: "/img/Recarga_de_vehículos_eléctricos.jpeg",
    group: "Control_Recarga_EV",
    sector: "Movilidad",
    searchtext: "vehículos eléctricos recarga parkings empresas comunidades",
  },
  {
    id: 11,
    title_es: "Automatización del control de invernaderos",
    description_es:
      "Monitoreo de riego, humedad del suelo, condiciones ambientales y consumos en agricultura.",
    full_description_es:
      "Incluye sensores de suelo, clima, control de riego automatizado e informes de eficiencia agrícola para maximizar el rendimiento.",
    icon: React.createElement(AgricultureIcon, { 
      sx: { fontSize: 60, color: primaryColor } 
    }),
    link: "/Docs",
    image: "/img/g01.png",
    group: "Control_Agricultura",
    sector: "Agricultura",
    searchtext: "agricultura riego humedad cultivo",
  },
  {
    id: 15,
    title_es: "Tracking de Flotas y Animales",
    description_es:
      "Monitoreo en tiempo real de vehículos o ganado mediante dispositivos IoT.",
    full_description_es:
      "Incluye localización GPS, geocercas, alertas de movimiento, historial de rutas y reportes de comportamiento para optimizar logística o gestión de animales.",
    icon: React.createElement(GpsFixedIcon, { 
      sx: { fontSize: 60, color: primaryColor } 
    }),
    link: "/Docs",
    image: "/img/tv01.png",
    group: "Tracking_Flotas_Animales",
    sector: "Logística / Agricultura",
    searchtext: "tracking GPS vehículos animales flotas ganadería logística",
  },
];
