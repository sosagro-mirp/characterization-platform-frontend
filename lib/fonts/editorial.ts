import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";

/**
 * Tipografías exclusivas de la propuesta visual "Editorial" (blanco y negro,
 * tipo revista/informe). Se importan únicamente en `components/landing/editorial/`,
 * sin afectar la fuente JetBrains Mono usada en el resto del sitio
 * (ver app/layout.tsx).
 */

export const sourceSerif4 = Source_Serif_4({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
  // Fuente variable: cubre los pesos 400/500/600/700 dentro de su rango
  // y expone el eje óptico (`opsz`) como variable, ajustado automáticamente
  // por el navegador vía `font-optical-sizing: auto`.
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

export const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-editorial-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-editorial-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
