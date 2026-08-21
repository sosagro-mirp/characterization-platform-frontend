import { DashboardKpi, DashboardQuestion } from "@/app/(dashboard)/types";

function escapeCsvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\n");
}

/** Descarga un CSV en el navegador. BOM (`﻿`) para que Excel detecte
 * UTF-8 en vez de leer las tildes como caracteres corruptos. */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function summarizeAggregation(question: DashboardQuestion): string {
  if (question.suppressed || !question.aggregation) {
    return "Sin datos (muestra insuficiente)";
  }
  const aggregation = question.aggregation;
  switch (aggregation.type) {
    case "yes_no":
      return `Sí: ${aggregation.yesPercentage.toFixed(0)}%, No: ${aggregation.noPercentage.toFixed(0)}%`;
    case "single_choice":
    case "multiple_choice":
    case "compliance":
      return aggregation.options
        .map((option) => `${option.text} (${option.percentage.toFixed(0)}%)`)
        .join("; ");
    case "likert":
      return aggregation.meanScore !== null
        ? `Media: ${aggregation.meanScore.toFixed(2)}/5`
        : "Sin media calculable";
    case "numeric":
      return `Media: ${aggregation.average?.toFixed(2) ?? "—"}, Mediana: ${aggregation.median?.toFixed(2) ?? "—"}, n=${aggregation.count}`;
    default:
      return "";
  }
}

/** Un CSV de una fila por pregunta — vistas de categoría / instrumento (spec 43, Fase 10). */
export function questionsToCsv(questions: DashboardQuestion[]): string {
  return toCsv(
    ["Sección", "Instrumento", "Pregunta", "Tipo", "n", "Resumen"],
    questions.map((question) => [
      question.sectionName,
      question.instrumentName ?? "",
      question.questionText,
      question.questionType,
      String(question.answeredCount),
      summarizeAggregation(question),
    ]),
  );
}

/** Un CSV de una fila por KPI — vista de resumen general, sin `questions[]` propio. */
export function kpisToCsv(kpis: DashboardKpi[]): string {
  return toCsv(
    ["KPI", "Valor", "Unidad", "Sin datos"],
    kpis.map((kpi) => [
      kpi.label,
      kpi.optionText ?? (kpi.value !== null ? String(kpi.value) : ""),
      kpi.unit ?? "",
      kpi.suppressed ? "Sí" : "No",
    ]),
  );
}
