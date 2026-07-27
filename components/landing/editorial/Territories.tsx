"use client";

import { territories } from "../../../lib/landing-content";
import { ColombiaMap, type ColombiaMapPalette } from "../territories/ColombiaMap";
import { SectionKicker } from "./SectionKicker";

const MONOCHROME_PALETTE: ColombiaMapPalette = {
  activeFill: "#171717",
  activeHover: "#000000",
  activePressed: "#000000",
  inactiveFill: "#e5e5e5",
  inactiveHover: "#d4d4d4",
};

/**
 * Sección 03 — Territorios. Mapa de Colombia en paleta monocromática
 * (reutiliza `ColombiaMap` con una paleta propia) junto a un listado en
 * filas de los departamentos y sus municipios, en vez de los chips de la
 * variante original.
 */
export function Territories() {
  return (
    <section
      id="territorios"
      className="scroll-mt-24 border-b border-black px-6 py-16 lg:px-16 lg:py-24"
    >
      <SectionKicker number="03" label="Territorios" />

      <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-editorial-serif)] text-3xl font-semibold leading-tight tracking-tight text-black text-balance lg:text-5xl">
        Seis departamentos, un mismo diagnóstico
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 lg:text-base text-pretty">
        El proyecto interviene unidades productivas en Antioquia, Caquetá,
        Chocó, La Guajira, Meta y Norte de Santander, priorizando municipios
        PDET y ZOMAC dentro de cada departamento.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="[&_[role=img]]:rounded-none [&_[role=img]]:border-black [&_[role=img]]:bg-none [&_[role=img]]:bg-white">
          <ColombiaMap palette={MONOCHROME_PALETTE} />
        </div>

        <ol className="flex flex-col border-t border-black">
          {territories.map((territory, index) => (
            <li
              key={territory.slug}
              className="grid grid-cols-[3rem_1fr] gap-4 border-b border-gray-300 py-5"
            >
              <span className="font-[family-name:var(--font-editorial-mono)] text-sm text-gray-400">
                3.{index + 1}
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-[family-name:var(--font-editorial-serif)] text-lg font-semibold tracking-tight text-black">
                    {territory.department}
                  </h3>
                  <span className="text-xs uppercase tracking-wider text-gray-500">
                    {territory.region}
                  </span>
                </div>
                <ul
                  role="list"
                  className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600"
                >
                  {territory.municipalities.map((m, i) => (
                    <li key={m.name} className="flex items-center gap-1.5">
                      {i > 0 ? (
                        <span aria-hidden="true" className="text-gray-300">
                          ·
                        </span>
                      ) : null}
                      <span>{m.name}</span>
                      {m.flags.length > 0 ? (
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">
                          ({m.flags.join(", ")})
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
