import Link from "next/link";
import { InstrumentSummary } from "@/app/(instrument)/types";

interface InstrumentCardProps {
  instrument: InstrumentSummary;
}

export function InstrumentCard({ instrument }: InstrumentCardProps) {
  const formattedDate = new Date(instrument.publishDate).toLocaleDateString(
    "es-CO",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold leading-snug text-neutral-900">
            {instrument.name}
          </h2>
          <p className="text-sm text-neutral-500">
            Versión {instrument.version} &middot; {formattedDate}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            instrument.isActive
              ? "bg-green-100 text-green-700"
              : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {instrument.isActive ? "Activo" : "Inactivo"}
        </span>
      </div>

      {instrument.actorTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {instrument.actorTypes.map((actor) => (
            <span
              key={actor.actorTypeId}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
            >
              {actor.name}
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/instrument/${instrument.instrumentId}`}
        className="mt-auto inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
      >
        Iniciar encuesta
      </Link>
    </article>
  );
}