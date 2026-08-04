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

/**
 * Tinte claro por cultivo (fondo de pill inactivo), tomado literal del
 * diseño — no derivado programáticamente. Fase 9 (WCAG AA): un pill
 * "cultivo + su color" necesita fondo y texto **fijos y emparejados**, como
 * ya hace `bg-brand-dark`/`text-brand-light` en el sidebar; usar la
 * superficie reactiva del tema (`--surface-muted`) detrás de un texto de
 * color fijo (ej. Café `#6B4226`, oscuro) pierde contraste en modo oscuro.
 */
export const CROP_TINTS = {
  cacao: "#faf1de",
  cafe: "#f0e8e2",
  cannabis: "#eef6e5",
  canamo: "#e3f2ee",
} as const;

export type CropColorKey = keyof typeof CROP_COLORS;

const FALLBACK_CROP_COLOR = "#737373";
const FALLBACK_CROP_TINT = "#f1f0ec";

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

/** Tinte claro emparejado con `cropColor` — mismo criterio de resolución. */
export function cropTint(name: string): string {
  const match = matchCropKey(name);
  return match ? CROP_TINTS[match] : FALLBACK_CROP_TINT;
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
