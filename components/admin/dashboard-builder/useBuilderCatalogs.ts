"use client";

import { useEffect, useState } from "react";
import type { BuilderCategory, BuilderEntityMetric } from "@/app/(admin)/types";
import type { ChartCompatMatrix } from "@/lib/dashboard/chartCompat";
import {
  getCompatMatrix,
  listBuilderCategories,
  listEntityMetrics,
} from "@/services/dashboard-builder.service";
import { errorMessage } from "./ui";

export interface BuilderCatalogs {
  categories: BuilderCategory[];
  matrix: ChartCompatMatrix;
  metrics: BuilderEntityMetric[];
}

/** Catálogos que necesita el formulario: categorías, matriz y métricas. */
export function useBuilderCatalogs() {
  const [catalogs, setCatalogs] = useState<BuilderCatalogs | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listBuilderCategories(), getCompatMatrix(), listEntityMetrics()])
      .then(([categories, matrix, metrics]) =>
        setCatalogs({
          categories: categories.toSorted(
            (a, b) => a.position - b.position || a.code.localeCompare(b.code),
          ),
          matrix,
          metrics,
        }),
      )
      .catch((err) => setError(errorMessage(err, "No se pudieron cargar los catálogos.")));
  }, []);

  return { catalogs, error };
}
