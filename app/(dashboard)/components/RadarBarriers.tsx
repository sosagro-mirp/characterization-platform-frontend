"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { BarriersRadar } from "../types";

interface RadarBarriersProps {
  data: BarriersRadar;
}

/** Radar de barreras S_DCU B1/B2/B3 (spec 43, Fase 7, D7: Recharts). */
export default function RadarBarriers({ data }: RadarBarriersProps) {
  if (data.b1 === null && data.b2 === null && data.b3 === null) {
    return (
      <p className="text-sm text-text-muted text-center py-10">
        Sin datos suficientes para el radar de barreras.
      </p>
    );
  }

  const chartData = [
    { axis: "B1 Acceso", value: data.b1 ?? 0 },
    { axis: "B2 Cognitiva", value: data.b2 ?? 0 },
    { axis: "B3 Confianza", value: data.b3 ?? 0 },
  ];

  return (
    <>
      {/* Fase 9 (accesibilidad): el radar no tiene equivalente textual
          nativo — a diferencia de `IndexBars`/`LikertDivergingMatrix`, que
          imprimen el valor junto a cada barra. */}
      <p className="sr-only">
        Índice por barrera, sobre 5: acceso y conectividad{" "}
        {data.b1?.toFixed(1) ?? "sin datos"}, cognitiva{" "}
        {data.b2?.toFixed(1) ?? "sin datos"}, confianza{" "}
        {data.b3?.toFixed(1) ?? "sin datos"}.
      </p>
      <ResponsiveContainer width="100%" height={210} aria-hidden="true">
        <RadarChart data={chartData} outerRadius="70%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} tickCount={3} />
          <Radar dataKey="value" stroke="#15803d" fill="#15803d" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </>
  );
}
