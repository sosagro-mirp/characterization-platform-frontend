"use client";

import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { territories } from "@/lib/landing-content";
import { DashboardDepartmentCount } from "../types";

/** Reutiliza el GeoJSON ya existente para la landing (components/landing/territories/ColombiaMap.tsx). */
const GEO_URL = "/maps/colombia.geo.json";

const NO_DATA_FILL = "#e5e7eb";
const LIGHT_GREEN = { r: 220, g: 252, b: 231 }; // brand-light
const DARK_GREEN = { r: 20, g: 83, b: 45 }; // brand-dark

const PROJECT_DEPARTMENTS = new Set(territories.map((t) => t.department));

function densityColor(ratio: number): string {
  const r = Math.round(LIGHT_GREEN.r + (DARK_GREEN.r - LIGHT_GREEN.r) * ratio);
  const g = Math.round(LIGHT_GREEN.g + (DARK_GREEN.g - LIGHT_GREEN.g) * ratio);
  const b = Math.round(LIGHT_GREEN.b + (DARK_GREEN.b - LIGHT_GREEN.b) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

interface HoverState {
  name: string;
  count: number | null;
  x: number;
  y: number;
}

interface ColombiaMapProps {
  data: DashboardDepartmentCount[];
}

export default function ColombiaMap({ data }: ColombiaMapProps) {
  const [hover, setHover] = useState<HoverState | null>(null);

  const countByName = useMemo(
    () => new Map(data.map((d) => [d.departmentName, d.count])),
    [data],
  );
  const maxCount = useMemo(
    () => Math.max(1, ...data.map((d) => d.count)),
    [data],
  );

  function handleMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!hover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHover((prev) =>
      prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : prev,
    );
  }

  return (
    <div
      role="img"
      aria-label="Mapa de Colombia con la distribución de encuestas por departamento"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
      className="relative w-full overflow-hidden rounded-lg border border-[var(--border)] bg-surface"
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1000, center: [-74, 4] }}
        width={400}
        height={420}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties?.DeNombre ?? "";
              const count = countByName.get(name) ?? null;
              const isProjectDepartment = PROJECT_DEPARTMENTS.has(name);
              const fill = count ? densityColor(count / maxCount) : NO_DATA_FILL;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  aria-label={name}
                  onMouseEnter={(e) => {
                    const rect = (
                      e.currentTarget.ownerSVGElement?.parentElement as HTMLDivElement | null
                    )?.getBoundingClientRect();
                    setHover({
                      name,
                      count,
                      x: rect ? e.clientX - rect.left : 0,
                      y: rect ? e.clientY - rect.top : 0,
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    default: {
                      fill,
                      stroke: isProjectDepartment ? "#14532d" : "#ffffff",
                      strokeWidth: isProjectDepartment ? 1.5 : 0.5,
                      outline: "none",
                      transition: "fill 150ms ease",
                    },
                    hover: {
                      fill,
                      stroke: isProjectDepartment ? "#14532d" : "#ffffff",
                      strokeWidth: isProjectDepartment ? 1.5 : 0.5,
                      outline: "none",
                      opacity: 0.85,
                      cursor: "pointer",
                    },
                    pressed: {
                      fill,
                      stroke: "#14532d",
                      strokeWidth: 1.5,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {hover && (
        <div
          role="status"
          aria-live="polite"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
          className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border)] bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-text-primary">{hover.name}</p>
          <p className="text-xs text-text-muted">
            {hover.count !== null ? `${hover.count} encuestas` : "Sin datos"}
          </p>
        </div>
      )}

      <p className="absolute bottom-2 left-3 right-3 text-[10px] uppercase tracking-wider text-text-muted pointer-events-none">
        Borde resaltado: departamentos del proyecto
      </p>
    </div>
  );
}
