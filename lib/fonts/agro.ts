import { IBM_Plex_Sans, Newsreader } from "next/font/google";

/**
 * Tipografías exclusivas de la propuesta visual "Agro" (cálida/editorial).
 * Se importan únicamente en `components/landing/agro/`, sin afectar la
 * fuente JetBrains Mono usada en el resto del sitio (ver app/layout.tsx).
 */

export const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-agro-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const newsreader = Newsreader({
  variable: "--font-agro-serif",
  subsets: ["latin"],
  // Fuente variable: cubre los pesos 400/500/600/700 dentro de su rango
  // (200-800) y expone el eje óptico (`opsz`) como variable, ajustado
  // automáticamente por el navegador vía `font-optical-sizing: auto`.
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});
