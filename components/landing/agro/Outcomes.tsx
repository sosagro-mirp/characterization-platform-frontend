import { TrendingUp } from "lucide-react";
import {
  expectedProducts,
  ifct4c,
  subIndicators,
} from "../../../lib/landing-content";
import { AgroSection } from "./AgroSection";
import { AgroSectionHeading } from "./AgroSectionHeading";

const fmt = (n: number) => n.toFixed(2).replace(/\.?0+$/, "") || n.toString();

function IndicatorBar({
  baseline,
  target,
  axisMax,
  precision = 2,
}: {
  baseline: number;
  target: number;
  axisMax: number;
  precision?: number;
}) {
  const baselinePct = (baseline / axisMax) * 100;
  const targetPct = (target / axisMax) * 100;
  const fmtN = (n: number) => n.toFixed(precision).replace(/\.?0+$/, "");

  return (
    <div className="w-full">
      <div className="relative h-2.5 rounded-full bg-[#EEF3E6]">
        <div
          className="absolute top-0 h-full rounded-full bg-[#FACC15]"
          style={{ left: `${baselinePct}%`, width: `${targetPct - baselinePct}%` }}
          aria-hidden="true"
        />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FFFFFF] bg-[#6B6552]"
          style={{ left: `${baselinePct}%` }}
          aria-hidden="true"
        />
        <span
          className="absolute top-1/2 h-[1.125rem] w-[1.125rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FFFFFF] bg-[#15803D] ring-4 ring-[#15803D]/15"
          style={{ left: `${targetPct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 text-xs">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6552]">
            Línea base
          </span>
          <span className="text-base font-bold text-[#20281F]">{fmtN(baseline)}</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#166534]">
            Meta
          </span>
          <span className="text-base font-bold text-[#166534]">{fmtN(target)}</span>
        </div>
      </div>
    </div>
  );
}

/** Indicador IFCT4C y sub-indicadores, más productos esperados (MGA). */
export function Outcomes() {
  const totalDelta = ifct4c.target - ifct4c.baseline;

  return (
    <AgroSection id="resultados" tone="creamAlt">
      <AgroSectionHeading
        kicker="Resultados comprometidos"
        title={`Indicador ${ifct4c.name}: de ${fmt(ifct4c.baseline)} a ${fmt(ifct4c.target)}`}
        subtitle={ifct4c.fullName}
      />

      <div className="mt-12 grid grid-cols-1 gap-8 rounded-3xl border border-[#E9E3D3] bg-[#FFFFFF] p-6 lg:mt-16 lg:grid-cols-[5fr_7fr] lg:gap-12 lg:p-10">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8D2BD] bg-[#EEF3E6] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#14532D]">
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
            Indicador principal
          </span>
          <p className="text-sm leading-relaxed text-[#20281F]">{ifct4c.formula}</p>
          <p className="text-xs text-[#6B6552]">
            Incremento comprometido:{" "}
            <span className="font-bold text-[#166534]">+{fmt(totalDelta)}</span> puntos
            en 60 meses.
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <IndicatorBar baseline={ifct4c.baseline} target={ifct4c.target} axisMax={12} />
        </div>
      </div>

      <ul role="list" className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
        {subIndicators.map((sub) => (
          <li key={sub.key}>
            <article className="flex h-full flex-col gap-4 rounded-2xl border border-[#E9E3D3] bg-[#FFFFFF] p-6">
              <h4 className="font-[family-name:var(--font-agro-serif)] text-base font-medium tracking-tight text-[#20281F] text-balance">
                {sub.name}
              </h4>
              <IndicatorBar
                baseline={sub.baseline}
                target={sub.target}
                axisMax={Math.max(sub.target * 1.4, sub.target + 1)}
                precision={
                  Number.isInteger(sub.baseline) && Number.isInteger(sub.target) ? 0 : 2
                }
              />
              {sub.description ? (
                <p className="mt-auto border-t border-[#E9E3D3] pt-3 text-xs leading-relaxed text-[#6B6552]">
                  {sub.description}
                </p>
              ) : null}
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-2xl border border-[#E9E3D3] bg-[#FFFFFF] p-6 lg:p-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-[#14532D]">
          Productos esperados (MGA)
        </h4>
        <ul role="list" className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {expectedProducts.map((p) => (
            <li
              key={p.mgaCode}
              className="flex items-center justify-between gap-3 border-b border-[#EEF3E6] py-1.5 text-xs text-[#20281F]"
            >
              <span>{p.product}</span>
              <span className="shrink-0 font-bold text-[#166534]">{p.target}</span>
            </li>
          ))}
        </ul>
      </div>
    </AgroSection>
  );
}
