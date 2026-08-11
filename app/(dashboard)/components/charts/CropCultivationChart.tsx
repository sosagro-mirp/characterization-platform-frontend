"use client";

import { DashboardQuestion } from "../../types";
import { BarDatum, yesNoToBarDatum } from "@/lib/dashboard/suppressedOption";
import { CROP_CULTIVATION_QUESTIONS } from "@/lib/dashboard/cropCultivation";
import HorizontalBarChart from "./HorizontalBarChart";

interface CropCultivationChartProps {
  /** Subconjunto de `data.questions` que matchean `CROP_CULTIVATION_QUESTIONS`
   * — puede tener menos de 4 si alguna quedó oculta por curaduría a futuro. */
  questions: DashboardQuestion[];
}

/**
 * Spec 66 (Fase 3, D8): combina las preguntas `yes_no` "¿Cultiva actualmente
 * X?" (una por cultivo del proyecto) en una sola `HorizontalBarChart` — "%
 * Sí" por cultivo — en vez de 4 tarjetas de dona sueltas. Ver
 * `lib/dashboard/cropCultivation.ts` para la justificación de por qué no es
 * una dona (preguntas no mutuamente excluyentes).
 */
export default function CropCultivationChart({ questions }: CropCultivationChartProps) {
  const byText = new Map(questions.map((q) => [q.questionText, q]));

  const data: BarDatum[] = CROP_CULTIVATION_QUESTIONS.filter(({ questionText }) =>
    byText.has(questionText),
  )
    .map(({ questionText, cropLabel }) => yesNoToBarDatum(byText.get(questionText)!, cropLabel))
    .sort((a, b) => b.percentage - a.percentage);

  if (data.length === 0) return null;

  return <HorizontalBarChart data={data} />;
}
