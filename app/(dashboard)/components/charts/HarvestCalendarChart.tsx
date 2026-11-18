import { DashboardQuestion } from "../../types";
import HarvestCalendar from "../HarvestCalendar";

interface HarvestCalendarChartProps {
  question: DashboardQuestion;
}

/**
 * Spec 66 (Fase 5, 2026-08-11): conecta `chartHint: "harvest-calendar"` al
 * componente `HarvestCalendar` ya existente (spec 43, D7) — hasta ahora solo
 * se usaba a mano en `OverviewView.tsx` para "Meses de cosecha principal"
 * (S2.4·23), sin pasar por `QuestionChartFactory`. Preguntas típicas: "¿En
 * qué meses se presenta la cosecha…?" (`multiple_choice`, opciones = meses).
 */
export default function HarvestCalendarChart({ question }: HarvestCalendarChartProps) {
  if (
    question.aggregation?.type !== "single_choice" &&
    question.aggregation?.type !== "multiple_choice"
  ) {
    return null;
  }
  return <HarvestCalendar options={question.aggregation.options} />;
}
