import { archivo, archivoNarrow } from "../../../lib/fonts/plataforma";
import { Axes } from "./Axes";
import { Crops } from "./Crops";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Navbar } from "./Navbar";
import { Outcomes } from "./Outcomes";
import { Participation } from "./Participation";
import { Partners } from "./Partners";
import { ResearchGroupsSection } from "./ResearchGroupsSection";
import { Territories } from "./Territories";

/**
 * Propuesta visual "Plataforma": estética producto SaaS oscura, verde lima
 * sobre negro. Tema fijo, NO responde a `prefers-color-scheme` — a
 * diferencia del resto del sitio, este fondo oscuro es una decisión de
 * identidad visual permanente de esta variante, no un modo de usuario.
 */
export function PlataformaLandingPage() {
  return (
    <div
      className={`${archivo.variable} ${archivoNarrow.variable} ${archivo.className} min-h-screen bg-[#0b0f0c] text-[#f4f7f2] antialiased`}
    >
      <Navbar />
      <main>
        <Hero />
        <Partners />
        <Crops />
        <Territories />
        <Axes />
        <Outcomes />
        <ResearchGroupsSection />
        <Participation />
      </main>
      <Footer />
    </div>
  );
}
