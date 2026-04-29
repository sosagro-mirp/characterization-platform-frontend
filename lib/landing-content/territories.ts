import type { Territory } from "./types";

export const territories: readonly Territory[] = [
  {
    slug: "antioquia",
    daneCode: "05",
    department: "Antioquia",
    region: "Eje Cafetero",
    regionSlug: "eje-cafetero",
    municipalities: [
      { name: "Medellín", flags: [] },
      { name: "Andes", flags: [] },
      { name: "Chigorodó", flags: ["PDET", "ZOMAC"] },
      { name: "Maceo", flags: [] },
    ],
  },
  {
    slug: "norte-de-santander",
    daneCode: "54",
    department: "Norte de Santander",
    region: "Centro Oriente",
    regionSlug: "centro-oriente",
    municipalities: [
      { name: "Cúcuta", flags: [] },
      { name: "Ocaña", flags: [] },
      { name: "Tibú", flags: [] },
      { name: "El Tarra", flags: [] },
      { name: "Hacarí", flags: ["PDET", "ZOMAC"] },
    ],
  },
  {
    slug: "meta",
    daneCode: "50",
    department: "Meta",
    region: "Los Llanos",
    regionSlug: "los-llanos",
    municipalities: [
      { name: "Villavicencio", flags: [] },
      { name: "Cumaral", flags: ["PDET", "ZOMAC"] },
    ],
  },
  {
    slug: "caqueta",
    daneCode: "18",
    department: "Caquetá",
    region: "Centro Sur Amazonía",
    regionSlug: "centro-sur-amazonia",
    municipalities: [
      { name: "Florencia", flags: ["PDET", "ZOMAC"] },
      { name: "San José del Fragua", flags: ["PDET", "ZOMAC"] },
    ],
  },
  {
    slug: "choco",
    daneCode: "27",
    department: "Chocó",
    region: "Pacífico",
    regionSlug: "pacifico",
    municipalities: [
      { name: "Quibdó", flags: ["ZOMAC"] },
      { name: "Medio San Juan", flags: [] },
    ],
  },
  {
    slug: "la-guajira",
    daneCode: "44",
    department: "La Guajira",
    region: "Caribe",
    regionSlug: "caribe",
    municipalities: [
      { name: "Riohacha", flags: [] },
      { name: "Urumita", flags: [] },
    ],
  },
] as const;
