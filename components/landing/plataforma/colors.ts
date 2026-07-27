/**
 * Paleta fija de la propuesta "Plataforma" — dark-first, no depende de
 * `prefers-color-scheme` ni de los tokens semánticos del resto del sitio
 * (ver app/globals.css). Verde lima sobre negro, estética producto SaaS.
 */
export const plataformaColors = {
  bg: "#0b0f0c",
  surface: "#10140f",
  surfaceMuted: "#141a12",
  border: "#2f3d31",
  borderSubtle: "#1e2a1f",
  lime: "#a3e635",
  limeHover: "#bef264",
  limePressed: "#84cc16",
  textPrimary: "#f4f7f2",
  textMuted: "#8a9a8d",
} as const;

/** Paleta lima-sobre-negro para el mapa de Colombia compartido. */
export const plataformaMapPalette = {
  activeFill: "#a3e635",
  activeHover: "#bef264",
  activePressed: "#84cc16",
  inactiveFill: "#1f2921",
  inactiveHover: "#2f3d31",
} as const;
