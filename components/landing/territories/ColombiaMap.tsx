"use client";

import { useState, type MouseEvent as ReactMouseEvent } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { territories, type Territory } from "../../../lib/landing-content";

const GEO_URL = "/maps/colombia.geo.json";

const codeToTerritory = new Map<string, Territory>(
  territories.map((t) => [t.daneCode, t])
);

const ACTIVE_FILL = "#15803d";
const ACTIVE_HOVER = "#166534";
const ACTIVE_PRESSED = "#14532d";
const INACTIVE_FILL = "#e5e7eb";
const INACTIVE_HOVER = "#cbd5e1";

interface HoverState {
  name: string;
  territory: Territory | null;
  x: number;
  y: number;
}

export function ColombiaMap() {
  const [hover, setHover] = useState<HoverState | null>(null);

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
        : prev
    );
  };

  return (
    <div
      role="img"
      aria-label="Mapa de Colombia con los seis departamentos del proyecto resaltados"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
      onClick={(e) => {
        // Tap en el área del mapa pero fuera de cualquier path → cerrar tooltip
        if ((e.target as HTMLElement).tagName !== "path") {
          setHover(null);
        }
      }}
      className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-br from-brand-light/40 via-white to-brand-light/20"
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1500, center: [-74, 4] }}
        width={400}
        height={500}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code: string | undefined = geo.properties?.DeCodigo;
              const name: string = geo.properties?.DeNombre ?? "";
              const territory = code ? codeToTerritory.get(code) ?? null : null;
              const isActive = territory !== null;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  data-dept={territory?.slug}
                  data-active={isActive ? "true" : "false"}
                  aria-label={name}
                  onMouseEnter={(e) => {
                    const rect = (
                      e.currentTarget.ownerSVGElement?.parentElement as HTMLDivElement | null
                    )?.getBoundingClientRect();
                    setHover({
                      name,
                      territory,
                      x: rect ? e.clientX - rect.left : 0,
                      y: rect ? e.clientY - rect.top : 0,
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => {
                    // En móvil/touch onClick es la señal confiable
                    e.stopPropagation();
                    const rect = (
                      e.currentTarget.ownerSVGElement?.parentElement as HTMLDivElement | null
                    )?.getBoundingClientRect();
                    setHover({
                      name,
                      territory,
                      x: rect ? e.clientX - rect.left : 0,
                      y: rect ? e.clientY - rect.top : 0,
                    });
                  }}
                  style={{
                    default: {
                      fill: isActive ? ACTIVE_FILL : INACTIVE_FILL,
                      stroke: "#ffffff",
                      strokeWidth: 0.5,
                      outline: "none",
                      transition: "fill 150ms ease",
                    },
                    hover: {
                      fill: isActive ? ACTIVE_HOVER : INACTIVE_HOVER,
                      stroke: "#ffffff",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: isActive ? ACTIVE_PRESSED : INACTIVE_HOVER,
                      stroke: "#ffffff",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {hover ? <Tooltip hover={hover} /> : null}

      <p className="absolute bottom-3 left-4 right-4 text-[10px] uppercase tracking-wider text-gray-500 pointer-events-none">
        Cobertura SOS Agro 4C · 6 departamentos
      </p>
    </div>
  );
}

function Tooltip({ hover }: { hover: HoverState }) {
  const { name, territory, x, y } = hover;
  const offsetX = 14;
  const offsetY = 14;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        left: x + offsetX,
        top: y + offsetY,
      }}
      className="pointer-events-none absolute z-10 max-w-65 translate-x-0 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm"
    >
      {territory ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold tracking-tight text-brand-dark">
              {territory.department}
            </h4>
            <span className="text-[10px] uppercase tracking-wider text-brand">
              SOS Agro
            </span>
          </div>
          <p className="text-[11px] text-gray-600 mt-0.5">{territory.region}</p>

          <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-gray-700">
            {territory.municipalities.map((m, i) => (
              <li key={m.name} className="flex items-center gap-1">
                {i > 0 ? (
                  <span className="text-gray-300" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <span>{m.name}</span>
                {m.flags.length > 0 ? (
                  <span
                    className="inline-block w-1 h-1 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            ))}
          </ul>

          {territory.municipalities.some((m) => m.flags.length > 0) ? (
            <p className="mt-2 text-[10px] text-gray-500">
              Punto amarillo: municipio PDET o ZOMAC
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm font-medium text-gray-700">{name}</p>
      )}
    </div>
  );
}
