import { Archivo, Archivo_Narrow } from "next/font/google";

/**
 * Tipografías exclusivas de la propuesta visual "Plataforma" (producto SaaS
 * oscuro, verde lima sobre negro). Se importan únicamente en
 * `components/landing/plataforma/`, sin afectar la fuente JetBrains Mono
 * usada en el resto del sitio (ver app/layout.tsx).
 */

export const archivo = Archivo({
  variable: "--font-plataforma-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const archivoNarrow = Archivo_Narrow({
  variable: "--font-plataforma-narrow",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
