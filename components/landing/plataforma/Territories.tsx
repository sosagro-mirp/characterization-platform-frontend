"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { territories } from "../../../lib/landing-content";
import { ColombiaMap } from "../territories/ColombiaMap";
import { plataformaMapPalette } from "./colors";
import { SectionHeader } from "./SectionHeader";

export function Territories() {
  const [selectedSlug, setSelectedSlug] = useState(territories[0]?.slug);
  const selected = territories.find((t) => t.slug === selectedSlug) ?? null;

  return (
    <section
      id="territorios"
      className="scroll-mt-24 border-t border-[#2f3d31] bg-[#0b0f0c] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Cobertura territorial"
          title="Seis departamentos, seis regiones de Colombia"
          subtitle="Selecciona un departamento para ver su región y municipios. PDET y ZOMAC marcan municipios con designación especial de conflicto."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-[7fr_5fr] lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ColombiaMap palette={plataformaMapPalette} />
          </div>

          <div className="flex flex-col gap-2">
            {territories.map((territory) => {
              const isSelected = territory.slug === selectedSlug;
              return (
                <button
                  key={territory.slug}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedSlug(territory.slug)}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-[#a3e635]/50 bg-[#141a12]"
                      : "border-[#2f3d31] bg-[#10140f] hover:border-[#2f3d31] hover:bg-[#141a12]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <MapPin
                      className={`h-4 w-4 shrink-0 ${
                        isSelected ? "text-[#a3e635]" : "text-[#8a9a8d]"
                      }`}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-bold text-[#f4f7f2]">
                        {territory.department}
                      </span>
                      <span className="block text-xs text-[#8a9a8d]">
                        {territory.region}
                      </span>
                    </span>
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a9a8d]">
                    {territory.municipalities.length} municipios
                  </span>
                </button>
              );
            })}

            {selected ? (
              <div className="mt-4 rounded-xl border border-[#2f3d31] bg-[#10140f] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#a3e635]">
                  {selected.department}
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-[#8a9a8d]">
                  {selected.municipalities.map((m, i) => (
                    <li key={m.name} className="flex items-center gap-1.5">
                      {i > 0 ? (
                        <span aria-hidden="true" className="text-[#2f3d31]">
                          ·
                        </span>
                      ) : null}
                      <span>{m.name}</span>
                      {m.flags.length > 0 ? (
                        <span className="inline-flex gap-1">
                          {m.flags.map((flag) => (
                            <span
                              key={flag}
                              className="rounded bg-[#1f2921] px-1.5 py-0.5 text-[9px] font-bold text-[#a3e635]"
                            >
                              {flag}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
