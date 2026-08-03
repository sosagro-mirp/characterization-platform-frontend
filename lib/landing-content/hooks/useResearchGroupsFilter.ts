"use client";

import { useMemo, useState } from "react";
import { researchGroups, type ResearchGroupArea } from "..";

export type ResearchGroupFilterKey = "todos" | ResearchGroupArea;

export const RESEARCH_GROUP_FILTERS: {
  key: ResearchGroupFilterKey;
  label: string;
}[] = [
  { key: "todos", label: "Todos" },
  { key: "datos", label: "Ciencia de datos" },
  { key: "robotica", label: "Control y robótica" },
  { key: "biomedica", label: "Biomédica" },
  { key: "quimica", label: "Química" },
];

/**
 * Estado de filtro por área de los grupos de investigación, compartido
 * entre las 4 variantes de landing. Cada variante decide su propio markup
 * de control (dropdown, chips, tabs), consumiendo `activeFilter`,
 * `setActiveFilter` y `visibleGroups`.
 */
export function useResearchGroupsFilter() {
  const [activeFilter, setActiveFilter] =
    useState<ResearchGroupFilterKey>("todos");

  const visibleGroups = useMemo(
    () =>
      activeFilter === "todos"
        ? researchGroups
        : researchGroups.filter((g) => g.area === activeFilter),
    [activeFilter],
  );

  return {
    filters: RESEARCH_GROUP_FILTERS,
    activeFilter,
    setActiveFilter,
    visibleGroups,
  };
}
