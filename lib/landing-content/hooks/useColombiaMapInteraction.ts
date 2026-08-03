"use client";

import { useState, type MouseEvent as ReactMouseEvent } from "react";
import { territories, type Territory } from "..";

export interface MapHoverState {
  name: string;
  territory: Territory | null;
  x: number;
  y: number;
}

const codeToTerritory = new Map<string, Territory>(
  territories.map((t) => [t.daneCode, t]),
);

/**
 * Estado y handlers de interacción del mapa de Colombia, compartidos entre
 * las 4 variantes de landing. Cada variante define su propia paleta de
 * colores (fill/hover/pressed) y su propio markup del tooltip.
 */
export function useColombiaMapInteraction() {
  const [hover, setHover] = useState<MapHoverState | null>(null);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!hover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHover((prev) =>
      prev
        ? {
            ...prev,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          }
        : prev,
    );
  };

  const handleContainerClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName !== "path") {
      setHover(null);
    }
  };

  const resolveTerritory = (code: string | undefined): Territory | null =>
    code ? (codeToTerritory.get(code) ?? null) : null;

  const setHoverFromGeographyEvent = (
    e: ReactMouseEvent<SVGPathElement>,
    name: string,
    territory: Territory | null,
  ) => {
    const rect = (
      e.currentTarget.ownerSVGElement?.parentElement as HTMLDivElement | null
    )?.getBoundingClientRect();
    setHover({
      name,
      territory,
      x: rect ? e.clientX - rect.left : 0,
      y: rect ? e.clientY - rect.top : 0,
    });
  };

  return {
    hover,
    handleMouseMove,
    handleContainerClick,
    handleMouseLeave: () => setHover(null),
    resolveTerritory,
    setHoverFromGeographyEvent,
  };
}
