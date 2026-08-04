import { fetchDashboardAnalytics, fetchKpis } from "../api";
import { DashboardFilters } from "../types";
import ViewHeader from "./ViewHeader";
import KpiStrip from "./KpiStrip";
import QuestionsAnalysisSection from "./QuestionsAnalysisSection";

interface CategoryViewProps {
  /** Ya debe incluir `categoryId` (o `instrumentId` en el drill-down
   * avanzado de D2) — el llamador decide la fusión, no este componente. */
  filters: DashboardFilters;
  /** Código `Cx` para el badge; `undefined` en el drill-down por `instrumentId`. */
  badge?: string;
}

/**
 * Vista de categoría genérica (spec 43, Fase 7): encabezado + KPI strip +
 * grid de preguntas. Usada para cualquier categoría **excepto C15**, que
 * tiene su propia vista consolidada (`DigitalDemandView`, D4) — y también
 * para el drill-down avanzado por `instrumentId` (D2), que ya no tiene
 * control propio en `GlobalFilterBar` pero sigue siendo una URL válida. A
 * diferencia de la Fase 6, no muestra el mapa — ni el checklist de esta
 * fase ni el diseño lo incluyen para vistas de categoría (solo para
 * "Resumen general").
 */
export default async function CategoryView({
  filters,
  badge,
}: CategoryViewProps) {
  const [data, kpis] = await Promise.all([
    fetchDashboardAnalytics(filters),
    fetchKpis(filters),
  ]);

  return (
    <div className="space-y-4">
      <ViewHeader
        title={data.metadata.categoryName ?? data.metadata.instrumentName ?? "Categoría"}
        badge={badge}
        metadata={data.metadata}
      />

      <KpiStrip kpis={kpis} />

      <QuestionsAnalysisSection data={data} filters={filters} />
    </div>
  );
}
