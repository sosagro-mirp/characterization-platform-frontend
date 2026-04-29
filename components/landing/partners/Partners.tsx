import { partners } from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";
import { PartnerGrid } from "./PartnerGrid";
import { PartnerLogo } from "./PartnerLogo";

const proponente = partners.filter((p) => p.role === "proponente");
const academia = partners.filter(
  (p) => p.role === "aliado" && p.axis === "academia"
);
const empresas = partners.filter(
  (p) => p.role === "aliado" && p.axis === "empresa"
);
const sociedad = partners.filter((p) => p.role === "beneficiario");

export function Partners() {
  return (
    <SectionContainer id="aliados" spacing="lg">
      <SectionHeading
        badge="Cuádruple hélice"
        title="Catorce entidades trabajando juntas"
        subtitle="Academia, empresa, estado y sociedad articuladas en un mismo proyecto bajo la coordinación del ITM y el respaldo de Minciencias y el Sistema General de Regalías."
      />

      <div className="mt-12 lg:mt-16 flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold tracking-tight text-brand-dark">
            Entidad proponente
          </h3>
          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl"
          >
            {proponente.map((p) => (
              <li key={p.slug}>
                <PartnerLogo partner={p} size="lg" />
              </li>
            ))}
            <li>
              <div className="flex h-full min-h-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Financiadores
                </p>
                <p className="text-sm font-bold text-brand-dark leading-tight">
                  Minciencias
                </p>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Sistema General de Regalías · Convocatoria 2023–2024
                </p>
              </div>
            </li>
          </ul>
        </div>

        <PartnerGrid
          title="Aliados académicos"
          description="Cinco universidades nacionales y una internacional articulan capacidades de I+D+i."
          partners={[...academia]}
          maxCols={5}
        />

        <PartnerGrid
          title="Aliados empresariales"
          description="Empresas de los sectores de café, cacao, cannabis y cáñamo, y de servicios tecnológicos."
          partners={[...empresas]}
          maxCols={5}
        />

        <PartnerGrid
          title="Beneficiarios sociales"
          description="Agremiaciones que articulan a las unidades productivas en territorio."
          partners={[...sociedad]}
          maxCols={3}
        />
      </div>
    </SectionContainer>
  );
}
