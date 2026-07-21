"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardOverview, DashboardOverviewBucket } from "../../types";

interface RespondentProfileProps {
  overview: DashboardOverview;
}

function BucketBarChart({ data }: { data: DashboardOverviewBucket[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const height = Math.max(100, sorted.length * 32);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => [`${value} encuestas`, "Total"]} />
        <Bar dataKey="count" fill="#15803d" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function StatCard({ title, average, median, count }: { title: string; average: number | null; median: number | null; count: number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface p-3">
      <p className="text-xs text-text-muted mb-2">{title}</p>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-[10px] text-text-muted">Media</p>
          <p className="font-medium text-text-primary">{average?.toFixed(1) ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">Mediana</p>
          <p className="font-medium text-text-primary">{median?.toFixed(1) ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">n</p>
          <p className="font-medium text-text-primary">{count}</p>
        </div>
      </div>
    </div>
  );
}

export default function RespondentProfile({ overview }: RespondentProfileProps) {
  if (overview.suppressed) return null;

  const hasAnyData =
    overview.byActorType.length > 0 ||
    overview.byCrop.length > 0 ||
    overview.byDepartment.length > 0 ||
    overview.age !== null ||
    overview.experienceYears !== null;

  if (!hasAnyData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {overview.age && (
        <StatCard
          title="Edad del productor (años)"
          average={overview.age.average}
          median={overview.age.median}
          count={overview.age.count}
        />
      )}
      {overview.experienceYears && (
        <StatCard
          title="Años de experiencia"
          average={overview.experienceYears.average}
          median={overview.experienceYears.median}
          count={overview.experienceYears.count}
        />
      )}

      {overview.byActorType.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-1">Por tipo de actor</p>
          <BucketBarChart data={overview.byActorType} />
        </div>
      )}
      {overview.byCrop.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-1">Por cultivo</p>
          <BucketBarChart data={overview.byCrop} />
        </div>
      )}
      {overview.byDepartment.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-1">Por departamento</p>
          <BucketBarChart data={overview.byDepartment} />
        </div>
      )}
    </div>
  );
}
