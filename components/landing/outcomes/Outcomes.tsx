import { TrendingUp } from "lucide-react";
import {
  expectedProducts,
  ifct4c,
  subIndicators,
} from "../../../lib/landing-content";
import { SectionContainer } from "../shared/SectionContainer";
import { SectionHeading } from "../shared/SectionHeading";
import { IndicatorBar } from "./IndicatorBar";

const fmt = (n: number) =>
  n.toFixed(2).replace(/\.?0+$/, "") || n.toString();

export function Outcomes() {
  const totalDelta = ifct4c.target - ifct4c.baseline;

  return (
    <SectionContainer id="resultados" spacing="lg">
      <SectionHeading
        badge="Resultados comprometidos"
        title={`Indicador IFCT4C: de ${fmt(ifct4c.baseline)} a ${fmt(ifct4c.target)}`}
        subtitle={`${ifct4c.fullName}. Compone la suma de tres sub-indicadores que articulan los tres ejes del proyecto.`}
      />

      {/* Indicador principal */}
      <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 lg:gap-12 rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-light/40 via-white to-white p-6 lg:p-10">
        <div className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-dark border border-brand/20">
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
            Indicador principal
          </span>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight text-brand-dark">
            {ifct4c.name}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {ifct4c.formula}
          </p>
          <p className="text-xs text-gray-500">
            Incremento comprometido:{" "}
            <span className="font-bold text-brand-dark">
              +{fmt(totalDelta)}
            </span>{" "}
            puntos en 60 meses.
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <IndicatorBar
            baseline={ifct4c.baseline}
            target={ifct4c.target}
            axisMin={0}
            axisMax={12}
          />
        </div>
      </div>

      {/* Sub-indicadores */}
      <ul
        role="list"
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6"
      >
        {subIndicators.map((sub) => (
          <li key={sub.key}>
            <article className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark">
                  Sub-indicador
                </span>
                <h4 className="text-base font-bold tracking-tight text-balance">
                  {sub.name}
                </h4>
              </div>

              <IndicatorBar
                baseline={sub.baseline}
                target={sub.target}
                axisMin={0}
                axisMax={Math.max(sub.target * 1.4, sub.target + 1)}
                precision={
                  Number.isInteger(sub.baseline) && Number.isInteger(sub.target)
                    ? 0
                    : 2
                }
              />

              {sub.description ? (
                <p className="text-xs text-gray-600 leading-relaxed mt-auto pt-2 border-t border-gray-100">
                  {sub.description}
                </p>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}
