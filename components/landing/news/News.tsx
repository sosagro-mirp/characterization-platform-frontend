import { Newspaper } from "lucide-react";
import { news } from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";
import { NewsCard } from "./NewsCard";

const sortedNews = [...news].sort((a, b) =>
  b.date.localeCompare(a.date)
);

export function News() {
  return (
    <SectionContainer id="divulgacion" spacing="lg">
      <SectionHeading
        badge="Divulgación"
        title="Últimas novedades del proyecto"
        subtitle="Eventos, publicaciones, convocatorias e hitos clave del proyecto SOS Agro 4C. Apropiación social del conocimiento como producto comprometido del OE1."
      />

      {sortedNews.length === 0 ? (
        <div className="mt-12 lg:mt-16 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <Newspaper
              className="h-5 w-5 text-gray-400"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-bold text-gray-700">
            Aún no hay novedades publicadas
          </p>
          <p className="text-xs text-gray-500 max-w-md">
            Los hitos y publicaciones del proyecto aparecerán aquí a medida que
            se ejecuten las actividades.
          </p>
        </div>
      ) : (
        <ul
          role="list"
          className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {sortedNews.map((entry) => (
            <li key={entry.id} className="h-full">
              <NewsCard entry={entry} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-[11px] text-gray-500 max-w-3xl">
        Esta sección es informativa y se mantiene de forma manual. La
        integración con un módulo dinámico de noticias está fuera del alcance
        de la fase actual.
      </p>
    </SectionContainer>
  );
}
