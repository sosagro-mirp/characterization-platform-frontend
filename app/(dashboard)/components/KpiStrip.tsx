import { DashboardKpi } from "../types";
import KpiCard from "./KpiCard";

interface KpiStripProps {
  kpis: DashboardKpi[];
}

export default function KpiStrip({ kpis }: KpiStripProps) {
  if (kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi, index) => (
        <KpiCard key={kpi.key} kpi={kpi} featured={index === 0} />
      ))}
    </div>
  );
}
