import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { AgroSection } from "./AgroSection";
import { AgroSectionHeading } from "./AgroSectionHeading";

/** CTA hacia el dashboard público de resultados agregados. */
export function DashboardCta() {
  return (
    <AgroSection id="dashboard-publico" tone="cream" spacing="md">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-[#E9E3D3] bg-[linear-gradient(135deg,#EEF3E6_0%,#FAF8F2_100%)] p-8 text-center lg:p-14">
        <AgroSectionHeading
          kicker="Datos abiertos"
          title="Explora los datos del proyecto"
          subtitle="Consulta en tiempo real los resultados agregados y anonimizados de las encuestas de caracterización aplicadas en café, cacao, cannabis y cáñamo en los seis departamentos del proyecto."
          align="center"
        />
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D3320] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] focus-visible:ring-offset-2"
        >
          <BarChart3 size={20} aria-hidden="true" />
          Ver dashboard público
        </Link>
      </div>
    </AgroSection>
  );
}
