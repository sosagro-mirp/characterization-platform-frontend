"use client";

import { Atom, ExternalLink } from "lucide-react";
import { useResearchGroupsFilter } from "../../../lib/landing-content/hooks/useResearchGroupsFilter";
import { AgroSection } from "./AgroSection";
import { AgroSectionHeading } from "./AgroSectionHeading";

const categoryStyle: Record<string, string> = {
  A1: "bg-[#15803D] text-white",
  A: "bg-[#14532D] text-white",
  B: "bg-[#166534]/80 text-white",
  C: "bg-[#D8D2BD] text-[#20281F]",
  Reconocido: "bg-[#EEF3E6] text-[#6B6552]",
};

/** Grupos de investigación filtrables por área temática. */
export function ResearchGroupsSection() {
  const { filters, activeFilter, setActiveFilter, visibleGroups } =
    useResearchGroupsFilter();

  return (
    <AgroSection id="grupos" tone="cream">
      <AgroSectionHeading
        kicker="Investigación"
        title="Grupos de investigación"
        subtitle="Grupos categorizados por Minciencias que articulan capacidades de control, IoT, ciencia de datos, procesamiento de señales y tecnologías ambientales en torno al proyecto."
      />

      <div className="mt-8 flex flex-wrap gap-2 lg:mt-10">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            aria-pressed={f.key === activeFilter}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              f.key === activeFilter
                ? "bg-[#14532D] text-white"
                : "border border-[#D8D2BD] bg-[#FFFFFF] text-[#6B6552] hover:bg-[#EEF3E6]"
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
            <article className="flex h-full flex-col gap-4 rounded-2xl border border-[#E9E3D3] bg-[#FFFFFF] p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF3E6] text-[#166534]">
                  <Atom className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    categoryStyle[group.category] ?? categoryStyle["Reconocido"]
                  }`}
                  title={`Categoría Minciencias ${group.category}`}
                >
                  Cat. {group.category}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-[family-name:var(--font-agro-serif)] text-lg font-medium tracking-tight text-[#20281F] text-balance">
                  {group.name}
                </h3>
                <p className="text-[10px] text-[#6B6552]">
                  GrupLac · {group.gruplacCode}
                </p>
                <p className="mt-1 text-xs font-bold text-[#166534]">{group.line}</p>
              </div>

              <p className="text-xs leading-relaxed text-[#6B6552]">
                {group.description}
              </p>

              <div className="mt-auto border-t border-[#E9E3D3] pt-3">
                {group.url ? (
                  <a
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] hover:text-[#15803D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 rounded"
                  >
                    Ver ficha en GrupLac
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-[10px] text-[#6B6552]">
                    Ficha GrupLac pendiente de enlazar
                  </span>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </AgroSection>
  );
}
