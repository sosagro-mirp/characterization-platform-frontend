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

      <div className="mt-12 lg:mt-16 mx-auto w-full lg:w-1/2 max-w-3xl">
        <ColombiaMap />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-sm bg-brand"
            aria-hidden="true"
          />
          Departamento del proyecto ({territories.length} en total)
        </span>
        <span className="text-gray-400" aria-hidden="true">
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

      <p className="mt-4 text-center text-[11px] text-gray-500 max-w-2xl mx-auto">
        PDET: Programas de Desarrollo con Enfoque Territorial · ZOMAC: Zonas
        Más Afectadas por el Conflicto Armado
      </p>
    </SectionContainer>
  );
}
