import { heroStats } from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";
import { StatCard } from "../shared/StatCard";

export function About() {
  return (
    <SectionContainer id="proyecto" spacing="lg">
      <SectionHeading
        badge="El proyecto"
        title="Fortaleciendo la productividad agrícola sostenible"
        subtitle="Menos del 10% de las unidades de producción agropecuaria en Colombia cuenta con algún activo TIC, y solo el 1,7% tiene acceso a Internet. Sos Agro 4C trabaja con academia, empresa, estado y sociedad para cerrar esa brecha en los sectores de café, cacao, cannabis y cáñamo, integrando ciencia de datos, IoT y bioeconomía en seis departamentos del país."
      />

      <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {heroStats.map((stat, i) => (
          <StatCard
            key={stat.key}
            value={stat.value}
            label={stat.label}
            description={stat.description}
            tone={i === 0 ? "brand" : "default"}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
