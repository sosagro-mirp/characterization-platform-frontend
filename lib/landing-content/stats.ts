import type { Stat } from "./types";

export const heroStats: readonly Stat[] = [
  {
    key: "departments",
    value: "6",
    label: "departamentos impactados",
    description:
      "Antioquia, Caquetá, Chocó, La Guajira, Meta y Norte de Santander.",
  },
  {
    key: "productiveUnits",
    value: "40",
    label: "unidades productivas con IoT",
    description: "18 café, 12 cacao, 5 cannabis y 5 cáñamo.",
  },
  {
    key: "duration",
    value: "60",
    label: "meses de ejecución",
    description: "Cinco períodos anuales, del Período 0 al Período 4.",
  },
] as const;

export const projectStats: readonly Stat[] = [
  {
    key: "entities",
    value: "14",
    label: "entidades participantes",
    description: "Cuádruple hélice: academia, empresa, estado y sociedad.",
  },
  {
    key: "ifct4c-baseline",
    value: "8.17",
    label: "línea base IFCT4C",
  },
  {
    key: "ifct4c-target",
    value: "10.2",
    label: "meta IFCT4C",
  },
] as const;
