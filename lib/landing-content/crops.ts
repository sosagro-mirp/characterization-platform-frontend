import type { Crop } from "./types";

export const crops: readonly Crop[] = [
  {
    slug: "cafe",
    name: "Café",
    image: "/cafe.jpg",
    productiveUnits: 18,
    description:
      "Monitoreo agroclimático y de calidad en finca cafetera para optimizar cultivo, cosecha y postcosecha.",
  },
  {
    slug: "cacao",
    name: "Cacao",
    image: "/cacao.jpg",
    productiveUnits: 12,
    description:
      "Captura de variables agroclimáticas y trazabilidad de procesos de fermentación y secado.",
  },
  {
    slug: "cannabis",
    name: "Cannabis",
    image: "/cannabis.jpg",
    productiveUnits: 5,
    description:
      "Sensores y visión multiespectral para control de calidad y caracterización de variedades.",
  },
  {
    slug: "canamo",
    name: "Cáñamo",
    image: "/cannabis.jpg",
    productiveUnits: 5,
    description:
      "Caracterización de cultivo y residuos para alternativas de aprovechamiento bioeconómico.",
  },
] as const;
