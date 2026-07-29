import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";

export function DashboardCta() {
  return (
    <SectionContainer id="dashboard-publico" spacing="md" centered>
      <SectionHeading
        badge="Datos abiertos"
        title="Explora los datos del proyecto"
        subtitle="Consulta en tiempo real los resultados agregados y anonimizados de las encuestas de caracterización aplicadas en café, cacao, cannabis y cáñamo en los seis departamentos del proyecto."
      />
      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand dark:bg-[#fde047] px-6 py-3 text-sm font-bold text-white dark:text-brand-dark transition-colors hover:bg-brand-hover dark:hover:bg-[#facc15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:focus-visible:ring-[#fde047] focus-visible:ring-offset-2"
      >
        <BarChart3 size={20} aria-hidden="true" />
        Ver dashboard público
      </Link>
    </SectionContainer>
  );
}
