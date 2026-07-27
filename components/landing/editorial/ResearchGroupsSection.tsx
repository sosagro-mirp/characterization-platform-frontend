"use client";

import { ExternalLink } from "lucide-react";
import { useResearchGroupsFilter } from "../../../lib/landing-content/hooks/useResearchGroupsFilter";
import { SectionKicker } from "./SectionKicker";

/**
 * Sección 06 — Grupos de investigación. Filtro por área como una fila de
 * pestañas de texto (subrayado, sin fondo de color) y resultados en filas
 * numeradas en vez de tarjetas.
 */
export function ResearchGroupsSection() {
  const { filters, activeFilter, setActiveFilter, visibleGroups } =
    useResearchGroupsFilter();

  return (
    <section
      id="investigacion"
      className="scroll-mt-24 border-b border-black px-6 py-16 lg:px-16 lg:py-24"
    >
      <SectionKicker number="06" label="Grupos de investigación" />

      <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-editorial-serif)] text-3xl font-semibold leading-tight tracking-tight text-black text-balance lg:text-5xl">
        Grupos de investigación categorizados por Minciencias
      </h2>

      <div
        role="tablist"
        aria-label="Filtrar grupos de investigación por área"
        className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-gray-300 pb-4"
      >
        {filters.map((filter) => {
          const isActive = filter.key === activeFilter;
          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(filter.key)}
              className={`border-b-2 pb-1 text-xs uppercase tracking-wider transition-colors ${
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <ol className="flex flex-col">
        {visibleGroups.map((group, index) => (
          <li
            key={group.slug}
            className="grid grid-cols-1 gap-3 border-b border-gray-300 py-6 lg:grid-cols-[3rem_1fr_auto] lg:items-start lg:gap-6"
          >
            <span className="font-[family-name:var(--font-editorial-mono)] text-sm text-gray-400">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-[family-name:var(--font-editorial-serif)] text-lg font-semibold tracking-tight text-black">
                  {group.name}
                </h3>
                <span className="font-[family-name:var(--font-editorial-mono)] text-[10px] uppercase tracking-widest text-gray-400">
                  Cat. {group.category} · {group.gruplacCode}
                </span>
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                {group.line}
              </p>
              <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
                {group.description}
              </p>
            </div>

            <div className="lg:text-right">
              {group.url ? (
                <a
                  href={group.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-black underline underline-offset-4 hover:text-gray-600"
                >
                  GrupLac
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-gray-400">
                  Ficha pendiente
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {visibleGroups.length === 0 ? (
        <p className="py-6 text-sm text-gray-500">
          No hay grupos registrados para esta área todavía.
        </p>
      ) : null}
    </section>
  );
}
