import { ibmPlexMono, ibmPlexSans, sourceSerif4 } from "../../../lib/fonts/editorial";
import { Axes } from "./Axes";
import { Crops } from "./Crops";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Outcomes } from "./Outcomes";
import { Participation } from "./Participation";
import { ResearchGroupsSection } from "./ResearchGroupsSection";
import { SideNav } from "./SideNav";
import { Territories } from "./Territories";

/**
 * Propuesta visual "Editorial": blanco y negro tipo revista/informe, con
 * side-nav fija e índice numerado de secciones. Punto de entrada montado por
 * `app/(landing-proposals)/editorial/page.tsx`.
 *
 * Monta sus propias tipografías (`lib/fonts/editorial.ts`) vía variables CSS
 * aplicadas solo dentro de este árbol, sin afectar JetBrains Mono del resto
 * del sitio.
 */
export function EditorialLandingPage() {
  return (
    <div
      className={`${sourceSerif4.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} min-h-screen bg-white font-[family-name:var(--font-editorial-sans)] text-black`}
    >
      <SideNav />

      <main className="lg:pl-[230px]">
        <Hero />
        <Crops />
        <Territories />
        <Axes />
        <Outcomes />
        <ResearchGroupsSection />
        <Participation />
        <Footer />
      </main>
    </div>
  );
}
