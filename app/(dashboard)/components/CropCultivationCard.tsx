import { DashboardQuestion } from "../types";
import { CropCultivationChart } from "./charts";

interface CropCultivationCardProps {
  questions: DashboardQuestion[];
}

/**
 * Spec 66 (Fase 3, D8, 2026-08-10): tarjeta combinada para las 4 preguntas
 * "¿Cultiva actualmente X?" — mismo shell que `QuestionCard`, pero con un
 * título propio (no el de ninguna pregunta individual) y sin el mensaje de
 * "muestra insuficiente" a nivel de tarjeta completa: cada cultivo
 * suprimido se resuelve dentro de `CropCultivationChart` (barra placeholder
 * con tooltip explícito), igual que una celda suprimida de
 * `MultipleChoiceChart` — no hace falta ocultar la tarjeta entera si al
 * menos un cultivo tiene muestra suficiente.
 */
export default function CropCultivationCard({ questions }: CropCultivationCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface p-4 flex flex-col gap-3">
      <h3 className="text-sm font-light uppercase tracking-wide text-text-primary">
        Cultivos que produce actualmente
      </h3>
      <CropCultivationChart questions={questions} />
    </div>
  );
}
