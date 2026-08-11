import { DashboardResponse } from "../types";
import QuestionsGrid from "./QuestionsGrid";
import SuppressedDataCard from "./SuppressedDataCard";
import EmptyStateCard from "./EmptyStateCard";

interface QuestionsAnalysisSectionProps {
  data: DashboardResponse;
}

/**
 * Grid de preguntas (spec 30, Fase 7/12), extraído de `page.tsx` en la
 * Fase 7 (spec 43) para que `CategoryView` y `DigitalDemandView` lo
 * reutilicen sin duplicar la lógica de supresión.
 *
 * Ajuste de estilo (spec 66, Fase 3, 2026-08-10): se eliminó el bloque
 * "Análisis agregado" (batería Likert, baterías Sí/No agrupadas,
 * `FocalizationChart`, perfil de encuestados) a pedido del usuario — dejaba
 * de usarse en todo el dashboard, no solo en C1. Los componentes que
 * quedaron sin consumidor (`aggregate/LikertBatteryChart.tsx`,
 * `aggregate/YesNoBatteryChart.tsx`, `aggregate/FocalizationChart.tsx`,
 * `aggregate/RespondentProfile.tsx`) no se borraron — quedan como código
 * muerto hasta que el usuario confirme eliminarlos.
 */
export default function QuestionsAnalysisSection({
  data,
}: QuestionsAnalysisSectionProps) {
  if (data.suppressed) {
    // D. de privacidad: 0 encuestas es "sin datos sincronizados" (EmptyStateCard);
    // 1-4 es "hay datos pero por debajo del umbral de anonimización" (SuppressedDataCard).
    return data.metadata.totalCount === 0 ? (
      <EmptyStateCard />
    ) : (
      <SuppressedDataCard reason={data.reason} />
    );
  }

  return <QuestionsGrid questions={data.questions} hasInstrument />;
}
