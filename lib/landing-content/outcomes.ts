import type { ExpectedProduct, SubIndicator } from "./types";

export const ifct4c = {
  name: "IFCT4C",
  fullName:
    "Indicador de Fortalecimiento de Capacidades Científico-Tecnológicas en los 4 Cultivos",
  baseline: 8.17,
  target: 10.2,
  formula:
    "Tecnologías implementadas + Factor de aprovechamiento de residuos + Laboratorios de ensayo especializados",
} as const;

export const subIndicators: readonly SubIndicator[] = [
  {
    key: "tech",
    name: "Tecnologías basadas en ciencia de datos",
    baseline: 0,
    target: 1,
    description:
      "Plataforma clúster con servicios de ciencia de datos para los actores de las cadenas productivas (OE1).",
  },
  {
    key: "residues",
    name: "Factor de aprovechamiento de residuos",
    baseline: 0.17,
    target: 0.2,
    description:
      "Proporción de residuos valorizados frente al total generado en las unidades productoras (OE2).",
  },
  {
    key: "labs",
    name: "Laboratorios de ensayo especializados",
    baseline: 8,
    target: 9,
    description:
      "Centro de análisis de referencia con métodos validados para el perfilamiento de productos y residuos (OE3).",
  },
] as const;

export const expectedProducts: readonly ExpectedProduct[] = [
  { mgaCode: "3906004", product: "Becas doctorales", target: "9" },
  { mgaCode: "3906003", product: "Becas de maestría", target: "14" },
  {
    mgaCode: "3906002",
    product: "Becas para jóvenes investigadores (pasantías)",
    target: "29",
  },
  { mgaCode: "3906008", product: "Estancias de investigación", target: "15" },
  {
    mgaCode: "3906017",
    product: "Cursos de entrenamiento especializado en I+D+i",
    target: "4",
  },
  {
    mgaCode: "3906012",
    product: "Documentos de investigación",
    target: "80",
  },
  {
    mgaCode: "3906020",
    product: "Centros y laboratorios dotados",
    target: "6",
  },
  { mgaCode: "3906013", product: "Prototipos desarrollados", target: "1" },
  { mgaCode: "3906015", product: "Documentos de planeación", target: "2" },
  { mgaCode: "3906014", product: "Asistencias técnicas", target: "1" },
] as const;
