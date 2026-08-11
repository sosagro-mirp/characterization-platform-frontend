/**
 * Spec 43 (D8): paleta categórica de datos — codifica un *valor*, no un tema,
 * así que se mantiene idéntica en claro y oscuro (a diferencia de los tokens
 * de superficie en `app/globals.css`, que sí cambian con el tema). Colores
 * tomados del diseño (`Dashboard SosAgro.html`), no inventados.
 *
 * Adelantado desde la Fase 6 original: `GlobalFilterBar` (Fase 5) ya necesita
 * las pills de cultivo. La Fase 6 solo migra los `charts/*` que hoy duplican
 * hexes propios para que importen de aquí — no crea el archivo desde cero.
 */

export const CROP_COLORS = {
  cacao: "#C4881B",
  cafe: "#6B4226",
  cannabis: "#6FA83C",
  canamo: "#2E8B77",
} as const;

export type CropColorKey = keyof typeof CROP_COLORS;

const FALLBACK_CROP_COLOR = "#737373";

/** Combining diacritical marks (U+0300–U+036F) tras normalizar a NFD. */
const DIACRITICS_PATTERN = /\p{Diacritic}/gu;

function normalize(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(DIACRITICS_PATTERN, "");
}

function matchCropKey(name: string): CropColorKey | undefined {
  const normalized = normalize(name);
  return (Object.keys(CROP_COLORS) as CropColorKey[]).find((key) =>
    normalized.includes(key),
  );
}

/** Resuelve el color de un cultivo por nombre (con o sin tildes); nunca lanza. */
export function cropColor(name: string): string {
  const match = matchCropKey(name);
  return match ? CROP_COLORS[match] : FALLBACK_CROP_COLOR;
}

/**
 * Escala Likert de 5 niveles (Totalmente en desacuerdo → Totalmente de
 * acuerdo), idéntica a la del diseño. Distinta, intencionalmente, de la
 * escala semáforo que ya usa `charts/LikertChart.tsx`
 * (`#dc2626,#f87171,#eab308,#4ade80,#16a34a`) — decisión de unificación
 * pendiente para la Fase 6 (D8), no de esta fase.
 */
export const LIKERT_SCALE_COLORS = [
  "#c0392b",
  "#e8a598",
  "#d4d4d4",
  "#86c08d",
  "#15803d",
] as const;

/**
 * Spec 66 (Fase 3, ajuste de estilo 2026-08-05): paleta categórica para
 * `MultipleChoiceChart` (BarrasH) — un color por barra según su posición
 * (mayor a menor conteo), en vez del verde único anterior. Cicla con
 * módulo si hay más opciones que colores. Tomada del mockup que trajo el
 * usuario para "Etapas de la cadena" (S1b·10), aplicada de forma genérica
 * a toda pregunta de selección múltiple, no solo a esa.
 */
export const CATEGORICAL_BAR_COLORS = [
  "#9CAF3E",
  "#7CB342",
  "#2E7D32",
  "#1B5E20",
  "#7A9E85",
  "#F2C230",
] as const;

/**
 * Spec 66 (Fase 3, ajuste de estilo 2026-08-05): colores fijos para la
 * torta de "Género del productor(a)" (mockup del usuario), específicos de
 * esta pregunta — no una paleta genérica para cualquier `DonutChart` futuro
 * (decisión explícita: cada pregunta curada a torta define la suya si hace
 * falta). Clave = texto exacto de la opción.
 */
export const GENDER_DONUT_COLORS: Record<string, string> = {
  Hombre: "#14532d",
  Mujer: "#65a30d",
  "Prefiere no responder": "#d4d4d4",
};
