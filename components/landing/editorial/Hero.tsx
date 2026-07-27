import { heroStats, partners, project } from "../../../lib/landing-content";

/**
 * Sección 01 — Introducción. Portada tipo revista: título editorial grande,
 * número decorativo "4.C" como marca de tapa, cifras clave en fila y una
 * franja de aliados institucionales en blanco y negro.
 */
export function Hero() {
  return (
    <section
      id="introduccion"
      className="relative scroll-mt-24 border-b border-black px-6 pb-16 pt-28 lg:px-16 lg:pb-24 lg:pt-32"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-8 select-none font-[family-name:var(--font-editorial-serif)] text-[9rem] font-semibold leading-none text-gray-100 lg:top-4 lg:text-[16rem]"
      >
        4.C
      </span>

      <div className="relative flex flex-col gap-10">
        <p className="font-[family-name:var(--font-editorial-mono)] text-xs uppercase tracking-[0.2em] text-gray-500">
          Proyecto SIGP {project.sigpCode} — SGR 2023–2024 — {project.call}
        </p>

        <h1 className="max-w-4xl font-[family-name:var(--font-editorial-serif)] text-5xl font-semibold leading-[1.02] tracking-tight text-black text-balance lg:text-8xl">
          {project.shortName}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-gray-700 lg:text-lg text-pretty">
          {project.generalObjective}
        </p>

        <ol className="mt-4 grid grid-cols-1 gap-0 border-t border-black sm:grid-cols-3">
          {heroStats.map((stat, index) => (
            <li
              key={stat.key}
              className={`flex flex-col gap-1 py-5 pr-6 ${
                index > 0 ? "sm:border-l sm:border-black sm:pl-6" : ""
              }`}
            >
              <span className="font-[family-name:var(--font-editorial-serif)] text-4xl font-semibold tracking-tight text-black">
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-wider text-gray-600">
                {stat.label}
              </span>
              {stat.description ? (
                <span className="mt-1 text-xs text-gray-500 leading-relaxed">
                  {stat.description}
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <PartnerStrip />
      </div>
    </section>
  );
}

function PartnerStrip() {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-gray-300 pt-6">
      <p className="font-[family-name:var(--font-editorial-mono)] text-[10px] uppercase tracking-[0.2em] text-gray-400">
        Cuádruple hélice — {partners.length} entidades
      </p>
      <ul
        role="list"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wide text-gray-500"
      >
        {partners.map((partner, index) => (
          <li key={partner.slug} className="flex items-center gap-4">
            <span>{partner.shortName ?? partner.name}</span>
            {index < partners.length - 1 ? (
              <span aria-hidden="true" className="text-gray-300">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
