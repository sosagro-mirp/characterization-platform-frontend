import { DashboardKpi } from "../types";
import KpiCard from "./KpiCard";

/**
 * Datos de juguete (a pedido del usuario): mientras se termina de ajustar el
 * diseño de las cards de resumen contra el mockup, esta tira deja de leer
 * los KPIs reales del API (`/kpis`) y muestra 4 valores estáticos fijos —
 * el mismo componente `KpiStrip` se reutiliza en Resumen general, categorías
 * y Demanda digital, así que el cambio aplica a las tres vistas.
 *
 * DEBT: reconectar con `fetchKpis` (ver `../api`) — tratado como su propio
 * spec, `spec/65_tira_kpis_resumen_general.md` (`[NOT STARTED]`), tras la
 * segunda revisión de `@reviewer` sobre spec 43. Por ahora es puramente
 * ilustrativo.
 */
const PLACEHOLDER_KPIS: DashboardKpi[] = [
  { key: "sample-size", label: "Encuestas en la muestra", value: 482, suppressed: false },
  { key: "avg-age", label: "Edad promedio", value: 41, unit: "años", suppressed: false },
  { key: "connectivity", label: "Con conectividad", value: 63, unit: "%", suppressed: false },
  { key: "top-crop", label: "Cultivo predominante", value: null, optionText: "Café", suppressed: false },
];

export default function KpiStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {PLACEHOLDER_KPIS.map((kpi, index) => (
        <KpiCard key={kpi.key} kpi={kpi} featured={index === 0} />
      ))}
    </div>
  );
}
