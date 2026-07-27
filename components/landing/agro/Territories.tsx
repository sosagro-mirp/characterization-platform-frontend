"use client";

import { MapPin } from "lucide-react";
import { territories } from "../../../lib/landing-content";
import { ColombiaMap } from "../territories/ColombiaMap";
import { AgroSection } from "./AgroSection";
import { AgroSectionHeading } from "./AgroSectionHeading";
import { agroMapPalette } from "./agroTheme";

/** Territorios de impacto: mapa interactivo (cálido) + listado editorial. */
export function Territories() {
  return (
    <AgroSection id="territorios" tone="creamAlt">
      <AgroSectionHeading
        kicker="Territorios"
        title="Presencia en seis departamentos"
        subtitle="El proyecto interviene municipios con vocación cafetera, cacaotera, cannábica y cañamera, varios de ellos priorizados como PDET o ZOMAC."
      />

      <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-[5fr_7fr] lg:gap-10">
        <ColombiaMap palette={agroMapPalette} />

        <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {territories.map((territory) => (
            <li key={territory.slug}>
              <article className="flex h-full flex-col gap-2 rounded-xl border border-[#E9E3D3] bg-[#FFFFFF] p-5">
                <div className="flex items-center gap-2 text-[#166534]">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <h3 className="text-sm font-bold tracking-tight text-[#20281F]">
                    {territory.department}
                  </h3>
                </div>
                <p className="text-xs font-medium text-[#6B6552]">
                  {territory.region}
                </p>
                <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#6B6552]">
                  {territory.municipalities.map((m, i) => (
                    <li key={m.name} className="flex items-center gap-1">
                      {i > 0 ? (
                        <span aria-hidden="true" className="text-[#D8D2BD]">
                          ·
                        </span>
                      ) : null}
                      <span>{m.name}</span>
                      {m.flags.length > 0 ? (
                        <span
                          className="inline-block h-1 w-1 rounded-full bg-[#FACC15]"
                          aria-hidden="true"
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-xs text-[#6B6552]">
        Punto dorado: municipio con clasificación PDET o ZOMAC.
      </p>
    </AgroSection>
  );
}
