"use client";

import { useEffect, useState } from "react";
import type { FarmerCoverageDetail } from "@/app/(admin)/types";
import { getFarmerCoverage } from "@/services/farmers.service";
import { CoverageView } from "@/components/farmers/CoverageView";

export function CoverageTab({
  farmerId,
  onOpenSurvey,
}: {
  farmerId: string;
  onOpenSurvey: (surveyId: string) => void;
}) {
  const [data, setData] = useState<FarmerCoverageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFarmerCoverage(farmerId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error al cargar la cobertura.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [farmerId]);

  if (loading)
    return <p className="text-sm text-[var(--text-muted)]">Cargando cobertura…</p>;
  if (error || !data)
    return (
      <p className="text-sm text-[var(--danger-fg)]">
        {error ?? "No se pudo cargar la cobertura."}
      </p>
    );

  return <CoverageView data={data} onOpenSurvey={onOpenSurvey} />;
}
