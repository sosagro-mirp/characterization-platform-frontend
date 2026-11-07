import type { Discrepancy } from "@/lib/farmers/farmerFarms";
import { humanizeDiscrepancyField } from "@/lib/farmers/farmerFarms";

export type DiscrepancyAction = "apply" | "dismiss";

/** `["apply","dismiss"]` si se puede aplicar; solo `["dismiss"]` si no; `[]` si ya está resuelta. */
export function allowedDiscrepancyActions(d: Discrepancy): DiscrepancyAction[] {
  if (d.status !== "open") return [];
  if (d.entityType === "farmer_farm" || !d.canApply) return ["dismiss"];
  return ["apply", "dismiss"];
}

function text(value: unknown, label?: string | null): string {
  const raw = label ?? value;
  if (raw === null || raw === undefined || raw === "") return "—";
  if (typeof raw === "string") return raw;
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
  return JSON.stringify(raw);
}

/** Textos legibles; `townId` usa los nombres en vez de los ids. */
export function discrepancyValueLabels(d: Discrepancy): {
  currentText: string;
  submittedText: string;
  liveText: string;
} {
  const isTown = d.field === "townId";
  return {
    currentText: text(d.currentValue, isTown ? d.currentLabel : null),
    submittedText: text(d.submittedValue, isTown ? d.submittedLabel : null),
    liveText: text(d.liveValue, isTown ? d.liveLabel : null),
  };
}

/** Pregunta de confirmación de «Aplicar», con avisos de desactualización y finca compartida. */
export function applyConfirmationText(
  d: Discrepancy,
  context: { farmFarmerCount?: number } = {},
): string {
  const { submittedText, liveText } = discrepancyValueLabels(d);
  const field = humanizeDiscrepancyField(d.field).toLowerCase();
  const parts = [`¿Cambiar ${field} a «${submittedText}»?`];
  if (d.isStale) {
    parts.push(
      `El dato cambió desde que se registró la diferencia: ahora vale «${liveText}».`,
    );
  }
  const count = context.farmFarmerCount ?? 0;
  if (d.entityType === "farm" && count > 1) {
    parts.push(
      `La finca la comparten ${count} productores; el cambio los afecta a todos.`,
    );
  }
  return parts.join(" ");
}
