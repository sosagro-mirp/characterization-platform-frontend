import { ibmPlexSans, newsreader } from "../../../lib/fonts/agro";
import { Axes } from "./Axes";
import { Crops } from "./Crops";
import { DashboardCta } from "./DashboardCta";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Navbar } from "./Navbar";
import { Outcomes } from "./Outcomes";
import { Participation } from "./Participation";
import { PartnerStrip } from "./PartnerStrip";
import { ResearchGroupsSection } from "./ResearchGroupsSection";
import { Territories } from "./Territories";

/**
 * Punto de entrada de la propuesta visual "Agro" (cálida/editorial).
 * Consume los mismos datos y hooks headless que el resto de propuestas de
 * landing (`lib/landing-content/`), con una estética propia: paleta cálida,
 * tipografía serif editorial (Newsreader) + sans (IBM Plex Sans), aplicada
 * solo dentro de este subárbol vía las variables CSS de `lib/fonts/agro.ts`.
 */
export function AgroLandingPage() {
  return (
    <div
      className={`${ibmPlexSans.variable} ${newsreader.variable} min-h-screen bg-[#FAF8F2] font-[family-name:var(--font-agro-sans)] text-[#20281F] antialiased`}
    >
      <Navbar />
      <main>
        <Hero />
        <PartnerStrip />
        <Crops />
        <Territories />
        <Axes />
        <Outcomes />
        <ResearchGroupsSection />
        <DashboardCta />
        <Participation />
      </main>
      <Footer />
    </div>
  );
}
