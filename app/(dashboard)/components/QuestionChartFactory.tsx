"use client";

import {
  ComplianceChart,
  DepartmentMap,
  DonutChart,
  HarvestCalendarChart,
  LikertChart,
  MultipleChoiceChart,
  NumericChart,
  SingleChoiceChart,
  UnsupportedQuestionType,
  YesNoChart,
} from "./charts";
import { DashboardQuestion } from "../types";
import { resolveChartKind } from "@/lib/dashboard/chartHint";

interface QuestionChartFactoryProps {
  question: DashboardQuestion;
}

/**
 * Spec 66 (Fase 3, D3): decide qué gráfica renderizar a partir de
 * `resolveChartKind` (chartHint curado en el backend, o el default por tipo
 * de pregunta). El resultado (`ChartKind`) no alcanza por sí solo para
 * elegir componente cuando dos tipos comparten la misma gráfica por defecto
 * ("bars" para `single_choice` y `compliance`) — para esos casos se
 * desambigua con `question.questionType`.
 */
export default function QuestionChartFactory({ question }: QuestionChartFactoryProps) {
  const kind = resolveChartKind({
    questionType: question.questionType,
    chartHint: question.chartHint,
  });

  switch (kind) {
    case "hidden":
      // El backend ya excluye las preguntas ocultas de `data.questions`
      // (spec 66, D4) — este caso es defensivo, no debería alcanzarse.
      return null;
    case "donut":
      // "donut" es el default de yes_no (YesNoChart, fijo a Sí/No) y también
      // un chartHint válido para curar single_choice a torta (DonutChart,
      // N opciones) — ver Género del productor(a), spec 66 D4/C1.
      return question.questionType === "yes_no" ? (
        <YesNoChart question={question} />
      ) : (
        <DonutChart question={question} />
      );
    case "bars":
      return question.questionType === "compliance" ? (
        <ComplianceChart question={question} />
      ) : (
        <SingleChoiceChart question={question} />
      );
    case "horizontal-bars":
      return <MultipleChoiceChart question={question} />;
    case "map":
      // Spec 66 (Fase 4, D6): hoy solo "Departamento" (C2) declara este
      // chartHint — single_choice cuyas opciones son nombres de
      // departamento. DepartmentMap asume esa forma, no genérica a
      // cualquier single_choice.
      return <DepartmentMap question={question} />;
    case "diverging":
      return <LikertChart question={question} />;
    case "harvest-calendar":
      return <HarvestCalendarChart question={question} />;
    case "histogram":
    case "histogram-by-unit":
      // DEBT: `histogram-by-unit` (numeric_with_unit) todavía no tiene
      // agregación en el backend (ver spec/backlog.md) — NumericChart no
      // renderiza nada hasta que exista `aggregation.type === "numeric"`.
      return <NumericChart question={question} />;
    default:
      return <UnsupportedQuestionType />;
  }
}
