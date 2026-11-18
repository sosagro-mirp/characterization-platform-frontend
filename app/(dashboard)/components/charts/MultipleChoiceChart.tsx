"use client";

import { DashboardQuestion } from "../../types";
import { BarDatum, toBarDatum } from "@/lib/dashboard/suppressedOption";
import HorizontalBarChart from "./HorizontalBarChart";

interface MultipleChoiceChartProps {
  question: DashboardQuestion;
}

/** Spec 66 (Fase 3, ajuste de estilo 2026-08-05): rediseño según mockup del
 * usuario ("Etapas de la cadena", aplicado de forma genérica a todo
 * BarrasH) — ver `HorizontalBarChart`, componente compartido con
 * `SingleChoiceChart` (mismo pedido de estilo para "Perfil del
 * productor"). */
export default function MultipleChoiceChart({ question }: MultipleChoiceChartProps) {
  if (question.aggregation?.type !== "multiple_choice") return null;

  // D2 (spec 66): orden sobre el conteo real antes de aplicar el
  // placeholder de celdas suprimidas.
  const data: BarDatum[] = [...question.aggregation.options]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map(toBarDatum);

  return (
    <div>
      <HorizontalBarChart data={data} />
      <p className="text-xs text-text-muted mt-1">
        El porcentaje es sobre el total de encuestados que respondieron. La suma
        puede superar el 100%.
      </p>
    </div>
  );
}
