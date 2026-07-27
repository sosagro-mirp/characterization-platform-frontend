import { ifct4c, subIndicators } from "../../../lib/landing-content";
import { SectionKicker } from "./SectionKicker";

const fmt = (n: number) => n.toFixed(2).replace(/\.?0+$/, "") || n.toString();

/**
 * Sección 05 — Indicador IFCT4C. Números grandes tipo "8.17 → 10.2" en vez
 * de las barras de progreso de la variante original, con los tres
 * sub-indicadores como filas numeradas debajo.
 */
export function Outcomes() {
  return (
    <section
      id="indicador"
      className="scroll-mt-24 border-b border-black px-6 py-16 lg:px-16 lg:py-24"
    >
      <SectionKicker number="05" label="Indicador IFCT4C" />

      <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-editorial-serif)] text-3xl font-semibold leading-tight tracking-tight text-black text-balance lg:text-5xl">
        {ifct4c.fullName}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 lg:text-base text-pretty">
        {ifct4c.formula}
      </p>

      <div className="mt-10 flex flex-wrap items-baseline gap-6 border-y border-black py-10 lg:gap-10">
        <span className="font-[family-name:var(--font-editorial-serif)] text-6xl font-semibold tracking-tight text-gray-400 lg:text-8xl">
          {fmt(ifct4c.baseline)}
        </span>
        <span
          aria-hidden="true"
          className="font-[family-name:var(--font-editorial-serif)] text-4xl text-gray-300 lg:text-6xl"
        >
          →
        </span>
        <span className="font-[family-name:var(--font-editorial-serif)] text-6xl font-semibold tracking-tight text-black lg:text-8xl">
          {fmt(ifct4c.target)}
        </span>
        <span className="self-end text-xs uppercase tracking-wider text-gray-500">
          línea base → meta a 60 meses
        </span>
      </div>

      <ol className="mt-10 flex flex-col border-t border-black">
        {subIndicators.map((sub, index) => (
          <li
            key={sub.key}
            className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-gray-300 py-5 lg:gap-6"
          >
            <span className="font-[family-name:var(--font-editorial-mono)] text-sm text-gray-400">
              5.{index + 1}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-[family-name:var(--font-editorial-serif)] text-lg font-semibold tracking-tight text-black">
                {sub.name}
              </h3>
              {sub.description ? (
                <p className="max-w-xl text-xs leading-relaxed text-gray-600 lg:text-sm">
                  {sub.description}
                </p>
              ) : null}
            </div>
            <div className="flex items-baseline gap-2 text-right">
              <span className="font-[family-name:var(--font-editorial-serif)] text-xl font-semibold text-gray-400 lg:text-2xl">
                {fmt(sub.baseline)}
              </span>
              <span aria-hidden="true" className="text-gray-300">
                →
              </span>
              <span className="font-[family-name:var(--font-editorial-serif)] text-xl font-semibold text-black lg:text-2xl">
                {fmt(sub.target)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
