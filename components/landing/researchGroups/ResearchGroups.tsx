import { Atom, ExternalLink } from "lucide-react";
import { researchGroups } from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";

const categoryStyle: Record<string, string> = {
  A1: "bg-brand text-white",
  A: "bg-brand-dark text-white",
  B: "bg-gray-700 text-white",
  C: "bg-gray-500 text-white",
  Reconocido: "bg-gray-200 text-gray-700",
};

export function ResearchGroups() {
  return (
    <SectionContainer id="grupos" spacing="lg">
      <SectionHeading
        badge="Investigación"
        title="Grupos de investigación"
        subtitle="Grupos categorizados por Minciencias que articulan capacidades de control, IoT, ciencia de datos, procesamiento de señales y tecnologías ambientales en torno al proyecto."
      />

      <ul
        role="list"
        className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
      >
        {researchGroups.map((group) => (
          <li key={group.slug} className="h-full">
            <article className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
                  <Atom
                    className="h-5 w-5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryStyle[group.category] ?? categoryStyle["Reconocido"]
                    }`}
                  title={`Categoría Minciencias ${group.category}`}
                >
                  Cat. {group.category}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold tracking-tight text-balance leading-snug">
                  {group.name}
                </h3>
                <p className="text-[10px] font-mono text-gray-500">
                  GrupLac · {group.gruplacCode}
                </p>
                <p className="text-xs text-brand-dark font-bold mt-1">
                  {group.line}
                </p>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {group.description}
              </p>

              <div className="mt-auto pt-3 border-t border-gray-100">
                {group.url ? (
                  <a
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
                  >
                    Ver ficha en GrupLac
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-[10px] text-gray-400">
                    Ficha GrupLac pendiente de enlazar
                  </span>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-gray-500 max-w-3xl">
        Las categorías corresponden al{" "}
        <a
          href="https://minciencias.gov.co/convocatorias/medicion-de-grupos-de-investigacion-desarrollo-tecnologico-o-de-innovacion"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-dark hover:text-brand underline-offset-2 hover:underline"
        >
          modelo de medición de grupos de Minciencias
        </a>
        . A1 y A son las dos categorías superiores otorgadas a grupos
        consolidados con producción de alto impacto.
      </p>
    </SectionContainer>
  );
}
