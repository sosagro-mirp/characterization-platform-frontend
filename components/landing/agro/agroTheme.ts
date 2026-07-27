import type { ColombiaMapPalette } from "../territories/ColombiaMap";

/**
 * Paleta cálida/editorial de la propuesta "Agro". Vive únicamente en este
 * directorio: no reemplaza ni toca los tokens de DESIGN.md usados por el
 * resto del sitio (--brand, --accent, etc.), que siguen intactos.
 *
 * Se expone como objeto JS (además de usarse vía clases arbitrarias de
 * Tailwind en los componentes) porque algunos consumidores externos, como
 * `ColombiaMap`, reciben colores por prop en vez de clases.
 */
export const AGRO_COLORS = {
  cream: "#faf8f2",
  creamAlt: "#eef3e6",
  surface: "#ffffff",
  ink: "#20281f",
  inkMuted: "#6b6552",
  terracotta: "#15803d",
  terracottaDark: "#166534",
  olive: "#14532d",
  oliveDark: "#0d3320",
  gold: "#facc15",
  border: "#e9e3d3",
  borderStrong: "#d8d2bd",
} as const;

export const agroMapPalette: ColombiaMapPalette = {
  activeFill: AGRO_COLORS.terracotta,
  activeHover: AGRO_COLORS.terracottaDark,
  activePressed: AGRO_COLORS.olive,
  inactiveFill: "#e5e7eb",
  inactiveHover: "#cbd5e1",
};
