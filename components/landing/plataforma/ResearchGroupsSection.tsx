"use client";

import { Atom, ExternalLink } from "lucide-react";
import { useResearchGroupsFilter } from "../../../lib/landing-content/hooks/useResearchGroupsFilter";
import { SectionHeader } from "./SectionHeader";

const categoryStyle: Record<string, string> = {
  A1: "bg-[#a3e635] text-[#0b0f0c]",
  A: "bg-[#84cc16] text-[#0b0f0c]",
  B: "bg-[#2f3d31] text-[#f4f7f2]",
  C: "bg-[#1f2921] text-[#8a9a8d]",
  Reconocido: "bg-[#1a1f1c] text-[#8a9a8d]",
};

export function ResearchGroupsSection() {
  const { filters, activeFilter, setActiveFilter, visibleGroups } =
    useResearchGroupsFilter();

  return (
    <section
      id="grupos"
      className="scroll-mt-24 border-t border-[#2f3d31] bg-[#0b0f0c] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Investigación"
          title="Grupos de investigación"
          subtitle="Grupos categorizados por Minciencias que articulan capacidades de control, IoT, ciencia de datos, procesamiento de señales y tecnologías ambientales en torno al proyecto."
        />

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              aria-pressed={f.key === activeFilter}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                f.key === activeFilter
                  ? "bg-[#a3e635] text-[#0b0f0c]"
                  : "border border-[#2f3d31] bg-[#10140f] text-[#8a9a8d] hover:text-[#f4f7f2]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul
          role="list"
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-6"
        >
          {visibleGroups.map((group) => (
            <li key={group.slug} className="h-full">
              <article className="flex h-full flex-col gap-4 rounded-2xl border border-[#2f3d31] bg-[#10140f] p-6 transition-colors hover:border-[#a3e635]/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f2921] text-[#a3e635]">
                    <Atom className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      categoryStyle[group.category] ?? categoryStyle.Reconocido
                    }`}
                    title={`Categoría Minciencias ${group.category}`}
                  >
                    Cat. {group.category}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-bold tracking-tight text-balance leading-snug text-[#f4f7f2]">
                    {group.name}
                  </h3>
                  <p className="text-[10px] font-mono text-[#8a9a8d]">
                    GrupLac · {group.gruplacCode}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#a3e635]">
                    {group.line}
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-[#8a9a8d]">
                  {group.description}
                </p>

                <div className="mt-auto border-t border-[#2f3d31] pt-3">
                  {group.url ? (
                    <a
                      href={group.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded text-xs font-bold text-[#a3e635] hover:text-[#bef264] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3e635] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10140f]"
                    >
                      Ver ficha en GrupLac
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-[#8a9a8d]">
                      Ficha GrupLac pendiente de enlazar
                    </span>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-3xl text-xs text-[#8a9a8d]">
          Las categorías corresponden al{" "}
          <a
            href="https://minciencias.gov.co/convocatorias/medicion-de-grupos-de-investigacion-desarrollo-tecnologico-o-de-innovacion"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#a3e635] underline-offset-2 hover:underline"
          >
            modelo de medición de grupos de Minciencias
          </a>
          . A1 y A son las dos categorías superiores otorgadas a grupos
          consolidados con producción de alto impacto.
        </p>
      </div>
    </section>
  );
}
