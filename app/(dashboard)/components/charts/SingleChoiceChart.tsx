"use client";

import { DashboardQuestion } from "../../types";
import { BarDatum, toBarDatum } from "@/lib/dashboard/suppressedOption";
import HorizontalBarChart from "./HorizontalBarChart";

interface SingleChoiceChartProps {
  question: DashboardQuestion;
}

/** Spec 66 (Fase 3, ajuste de estilo 2026-08-05): mismo estilo de barras
 * que `MultipleChoiceChart` (mockup "Etapas de la cadena"), a pedido del
 * usuario — ver `HorizontalBarChart`, componente compartido. */
export default function SingleChoiceChart({ question }: SingleChoiceChartProps) {
  if (question.aggregation?.type !== "single_choice") return null;

  // D2 (spec 66): el orden se decide sobre las opciones reales (una celda
  // suprimida sigue existiendo, solo deja de mostrar su valor) antes de
  // mapear al placeholder de la barra.
  const data: BarDatum[] = [...question.aggregation.options]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map(toBarDatum);

  return <HorizontalBarChart data={data} />;
}
