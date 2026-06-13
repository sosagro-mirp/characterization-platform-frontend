import type { ResearchGroup } from "./types";

export const researchGroups: readonly ResearchGroup[] = [
  {
    slug: "ciencias-computacionales",
    name: "Automática, Electrónica y Ciencias Computacionales",
    shortName: "Ciencias Computacionales",
    gruplacCode: "COL0053581",
    category: "A1",
    line: "Sistemas de control, robótica e IoT",
    description:
      "Diseño e integración de sistemas embebidos, redes de sensores y arquitecturas de captura de datos en finca.",
    url: "https://scienti.minciencias.gov.co/gruplac/jsp/visualiza/visualizagr.jsp?nro=COL0053581",
  },
  {
    slug: "maquinas-inteligentes",
    name: "Máquinas Inteligentes y Reconocimiento de Patrones",
    shortName: "Máquinas Inteligentes",
    gruplacCode: "COL0123729",
    category: "A",
    line: "Procesamiento de datos de alta dimensión",
    description:
      "Modelos de aprendizaje de máquina aplicados a imágenes multiespectrales, firmas espectrales y series agroclimáticas.",
    url: "https://scienti.minciencias.gov.co/gruplac/jsp/visualiza/visualizagr.jsp?nro=COL0123729",
  },
  {
    slug: "sistemas-control-robotica",
    name: "Sistemas de Control y Robótica",
    gruplacCode: "COL0123701",
    category: "A1",
    line: "Internet de las Cosas",
    description:
      "Plataformas de adquisición y control para monitoreo automático de variables de cultivo, cosecha y postcosecha.",
    url: "https://scienti.minciencias.gov.co/gruplac/jsp/visualiza/visualizagr.jsp?nro=COL0123701",
  },
  {
    slug: "innovacion-biomedica",
    name: "Innovación Biomédica",
    shortName: "GI2B",
    gruplacCode: "COL0056476",
    category: "A1",
    line: "Ciencias Ingenieriles Biomédicas",
    description:
      "Métodos de procesamiento de señales e imagen aplicados al análisis de calidad y trazabilidad de productos agrícolas.",
    url: "https://scienti.minciencias.gov.co/gruplac/jsp/visualiza/visualizagr.jsp?nro=COL0056476",
  },
  {
    slug: "alquimia",
    name: "Química Básica, Aplicada y Ambiente",
    shortName: "Alquimia",
    gruplacCode: "COL0095769",
    category: "A",
    line: "Tecnologías ambientales y desarrollo de materiales",
    description:
      "Creación y asesoría en tecnologías ambientales, energéticas y desarrollo de materiales que aporten al avance de la ciencia básica y se adapten al sector industrial productivo.",
    url: "https://scienti.minciencias.gov.co/gruplac/jsp/visualiza/visualizagr.jsp?nro=COL0095769",
  },
] as const;
