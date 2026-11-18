import { fetchServedChartsOrNull } from "../api";
import { DashboardFilters } from "../types";
import ViewHeader from "./ViewHeader";
import KpiStrip from "./KpiStrip";
import ChartsGrid from "./ChartsGrid";
import SuppressedDataCard from "./SuppressedDataCard";

interface CategoryViewProps {
  categoryCode: string;
  filters: DashboardFilters;
}

/**
 * Vista de categoría (spec 109): encabezado + KPI strip + los gráficos
 * publicados de la categoría, en el orden y con el ancho configurados en el
 * constructor. Reemplaza la grilla «una tarjeta por pregunta elegible» del
 * spec 43/66: ya no hay curaduría en código.
 */
export default async function CategoryView({ categoryCode, filters }: CategoryViewProps) {
  // Una categoría que dejó de tener gráficos públicos (o se desactivó) entre
  // que se cacheó la barra lateral y esta consulta responde 404: se muestra
  // un aviso en vez de romper la página.
  const data = await fetchServedChartsOrNull(categoryCode, filters);
  if (!data) {
    return (
      <ChartsGrid
        charts={[]}
        emptyMessage="Esta categoría ya no tiene gráficos publicados. Vuelve al resumen general o elige otra categoría."
      />
    );
  }

  return (
    <div className="space-y-4">
      <ViewHeader
        metadata={
          data.totalCount !== null
            ? { totalCount: data.totalCount, filters, dateRange: null }
            : undefined
        }
      />

      <KpiStrip />

      {data.suppressed && (
        <SuppressedDataCard reason="La muestra con estos filtros es insuficiente: los gráficos de preguntas se muestran suprimidos." />
      )}

      <ChartsGrid charts={data.charts} />
    </div>
  );
}
