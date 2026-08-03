import { MapPin } from "lucide-react";
import { territories } from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";
import { ColombiaMap } from "./ColombiaMap";

export function Territories() {
  return (
    <SectionContainer id="territorios" spacing="lg">
      <SectionHeading
        badge="Cobertura territorial"
        title="Seis departamentos, seis regiones de Colombia"
        subtitle="Pasa el cursor (o toca) sobre cada departamento del proyecto para ver su región, municipios y designación PDET o ZOMAC."
      />

      <div className="mt-12 lg:mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr] lg:gap-10">
        <ul role="list" className="hidden lg:flex lg:flex-col lg:gap-3">
          {territories.map((territory) => (
            <li key={territory.slug}>
              <article className="flex h-full flex-col gap-2 rounded-xl border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1e293b] p-5">
                <div className="flex items-center gap-2 text-brand dark:text-[#fde047]">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <h3 className="text-sm font-bold tracking-tight text-brand-dark dark:text-white">
                    {territory.department}
                  </h3>
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-[#94a3b8]">
                  {territory.region}
                </p>
                <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-gray-500 dark:text-[#94a3b8]">
                  {territory.municipalities.map((m, i) => (
                    <li key={m.name} className="flex items-center gap-1">
                      {i > 0 ? (
                        <span
                          aria-hidden="true"
                          className="text-gray-300 dark:text-[#475569]"
                        >
                          ·
                        </span>
                      ) : null}
                      <span>{m.name}</span>
                      {m.flags.length > 0 ? (
                        <span
                          className="inline-block h-1 w-1 rounded-full bg-accent"
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

        <div className="relative mx-auto aspect-[4/5] w-full max-w-3xl lg:mx-0 lg:aspect-auto lg:h-full lg:max-w-none">
          <ColombiaMap fill />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600 dark:text-[#94a3b8]">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm bg-brand dark:bg-[#fde047]"
            aria-hidden="true"
          />
          Departamento del proyecto ({territories.length} en total)
        </span>
        <span className="text-gray-400 dark:text-[#64748b]" aria-hidden="true">
          ·
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full bg-accent"
            aria-hidden="true"
          />
          Municipio con designación PDET o ZOMAC
        </span>
      </div>

      <p className="mt-4 text-center text-[11px] text-gray-500 dark:text-[#94a3b8] max-w-2xl mx-auto">
        PDET: Programas de Desarrollo con Enfoque Territorial · ZOMAC: Zonas
        Más Afectadas por el Conflicto Armado
      </p>
    </SectionContainer>
  );
}
