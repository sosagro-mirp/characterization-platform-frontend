import { ifct4c, subIndicators } from "../../../lib/landing-content";
import { IndicatorBar } from "./IndicatorBar";

const fmt = (n: number, precision = 2) =>
  n.toFixed(precision).replace(/\.?0+$/, "") || n.toString();

const progressPercent = (baseline: number, target: number) =>
  target > 0 ? Math.min(100, Math.max(0, (baseline / target) * 100)) : 0;

export function Outcomes() {
  const ifctPercent = progressPercent(ifct4c.baseline, ifct4c.target);

  return (
    <section
      id="resultados"
      className="relative isolate scroll-mt-24 overflow-hidden bg-brand-dark dark:bg-transparent px-4 py-16 md:px-6 md:py-24 lg:px-8"
    >
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:6rem_4rem]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="max-w-max rounded-lg border border-white/20 px-3 py-1 text-xs lg:text-sm mb-4 flex items-center font-medium text-white/90">
            <span className="w-1.5 h-1.5 bg-green-400 dark:bg-[#fde047] rounded-full mr-2" aria-hidden="true" />
            Resultados comprobados
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-balance text-white lg:text-5xl">
            {`Indicador IFCT4C: de ${fmt(ifct4c.baseline)} a ${fmt(ifct4c.target)}`}
          </h2>
          <p className="mt-6 text-pretty text-sm text-white/70 lg:text-base">
            {ifct4c.fullName}. Compone la suma de tres sub-indicadores que
            articulan los tres ejes del proyecto.
          </p>
        </div>

        {/* Indicador principal */}
        <div className="mt-12 rounded-lg border border-white/15 bg-white/5 p-6 lg:mt-16 lg:p-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xl font-bold text-white">{ifct4c.name}</span>
            <span className="text-xs text-white/70">
              LÍNEA BASE <strong className="text-white">{fmt(ifct4c.baseline)}</strong>
              <span className="mx-2">·</span>
              META <strong className="text-accent dark:text-[#fde047]">{fmt(ifct4c.target)}</strong>
            </span>
          </div>
          <IndicatorBar percent={ifctPercent} variant="primary" />
        </div>

        {/* Sub-indicadores */}
        <ul
          role="list"
          className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5"
        >
          {subIndicators.map((sub) => {
            const precision =
              Number.isInteger(sub.baseline) && Number.isInteger(sub.target)
                ? 0
                : 2;

            return (
              <li key={sub.key}>
                <article className="flex h-full flex-col gap-3 rounded-lg border border-white/15 bg-white/5 p-5">
                  <h3 className="text-xs text-white/70">{sub.name}</h3>
                  <IndicatorBar
                    percent={progressPercent(sub.baseline, sub.target)}
                  />
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>base {fmt(sub.baseline, precision)}</span>
                    <span className="font-bold text-white">
                      meta {fmt(sub.target, precision)}
                    </span>
                  </div>
                  {sub.description ? (
                    <p className="mt-auto border-t border-white/10 pt-2 text-[11px] leading-relaxed text-white/50">
                      {sub.description}
                    </p>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
