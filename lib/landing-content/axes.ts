import type { Axis } from "./types";

export const axes: readonly Axis[] = [
  {
    code: "OE1",
    iconName: "Microscope",
    title: "Ciencia de datos e IoT",
    tagline: "Captura, almacenamiento, procesamiento y análisis de datos",
    description:
      "Despliegue de sensores agroclimáticos, cámaras multiespectrales y aplicaciones móviles en 40 unidades productivas. Plataforma clúster de consulta abierta para todos los actores de las cadenas, fundamentada en un estudio previo de capacidades humanas y técnicas para garantizar la adopción.",
    status: "active",
    activities: [
      "Caracterización de capacidades técnicas y humanas",
      "Plataforma de captura, análisis y visualización de datos",
      "Modelos de IA para clasificación, predicción y monitoreo",
    ],
  },
  {
    code: "OE2",
    iconName: "Recycle",
    title: "Bioeconomía y valorización de residuos",
    tagline: "Aprovechamiento integral de subproductos agrícolas",
    description:
      "Desarrollo de alternativas energéticas, biopolímeros, materiales para empaques biodegradables y materiales porosos para tratamiento de aguas a partir de residuos generados en las unidades productoras de café, cacao, cannabis y cáñamo.",
    status: "upcoming",
    activities: [
      "Caracterización de residuos por sector",
      "Procesos de valorización energética y de materiales",
      "Prototipado de bioproductos",
    ],
  },
  {
    code: "OE3",
    iconName: "FlaskConical",
    title: "Centro de análisis de referencia",
    tagline: "Métodos analíticos estandarizados y validados",
    description:
      "Laboratorio de referencia para el perfilamiento biológico, físico y químico de los materiales vegetales, sus derivados y residuos. Portafolio de servicios abierto para todos los actores de las cadenas productivas.",
    status: "upcoming",
    activities: [
      "Implementación de métodos validados de perfilamiento",
      "Acreditación de laboratorios de ensayo especializados",
      "Servicios analíticos para academia, empresa y comunidades",
    ],
  },
] as const;
