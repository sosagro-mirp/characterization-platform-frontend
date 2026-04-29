import type { ResearchGroup } from "./types";

// TODO: agregar `url` con la ficha pública en GrupLac (Minciencias) cuando se
// verifique el identificador interno de cada grupo.
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
  },
  {
    slug: "sistemas-control-robotica",
    name: "Sistemas de Control y Robótica",
    gruplacCode: "COL0123701",
    category: "A1",
    line: "Internet de las Cosas",
    description:
      "Plataformas de adquisición y control para monitoreo automático de variables de cultivo, cosecha y postcosecha.",
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
  },
] as const;
