"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import {
  useColombiaMapInteraction,
  type MapHoverState,
} from "../../../lib/landing-content/hooks/useColombiaMapInteraction";

const GEO_URL = "/maps/colombia.geo.json";

export interface ColombiaMapPalette {
  activeFill: string;
  activeHover: string;
  activePressed: string;
  inactiveFill: string;
  inactiveHover: string;
}

const DEFAULT_PALETTE: ColombiaMapPalette = {
  activeFill: "var(--map-active)",
  activeHover: "var(--map-active-hover)",
  activePressed: "var(--map-active-pressed)",
  inactiveFill: "var(--border)",
  inactiveHover: "var(--border-strong)",
};

interface ColombiaMapProps {
  palette?: ColombiaMapPalette;
}

export function ColombiaMap({ palette = DEFAULT_PALETTE }: ColombiaMapProps) {
  const {
    hover,
    handleMouseMove,
    handleContainerClick,
    handleMouseLeave,
    resolveTerritory,
    setHoverFromGeographyEvent,
  } = useColombiaMapInteraction();

  return (
    <div
      role="img"
      aria-label="Mapa de Colombia con los seis departamentos del proyecto resaltados"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleContainerClick}
      className="relative w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-[#334155] bg-linear-to-br from-brand-light/40 via-white to-brand-light/20 dark:from-brand-light/10 dark:via-[#0f172a] dark:to-brand-light/5"
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
              const territory = resolveTerritory(code);
              const isActive = territory !== null;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  data-dept={territory?.slug}
                  data-active={isActive ? "true" : "false"}
                  aria-label={name}
                  onMouseEnter={(e) =>
                    setHoverFromGeographyEvent(e, name, territory)
                  }
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => {
                    // En móvil/touch onClick es la señal confiable
                    e.stopPropagation();
                    setHoverFromGeographyEvent(e, name, territory);
                  }}
                  style={{
                    default: {
                      fill: isActive ? palette.activeFill : palette.inactiveFill,
                      stroke: "#ffffff",
                      strokeWidth: 0.5,
                      outline: "none",
                      transition: "fill 150ms ease",
                    },
                    hover: {
                      fill: isActive ? palette.activeHover : palette.inactiveHover,
                      stroke: "#ffffff",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: isActive ? palette.activePressed : palette.inactiveHover,
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

      <p className="absolute bottom-3 left-4 right-4 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#94a3b8] pointer-events-none">
        Cobertura SOS Agro 4C · 6 departamentos
      </p>
    </div>
  );
}

function Tooltip({ hover }: { hover: MapHoverState }) {
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
      className="pointer-events-none absolute z-10 max-w-65 translate-x-0 rounded-lg border border-gray-200 dark:border-[#334155] bg-white/95 dark:bg-[#0f172a]/95 p-3 shadow-lg backdrop-blur-sm"
    >
      {territory ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold tracking-tight text-brand-dark dark:text-white">
              {territory.department}
            </h4>
            <span className="text-[10px] uppercase tracking-wider text-brand dark:text-[#fde047]">
              SOS Agro
            </span>
          </div>
          <p className="text-[11px] text-gray-600 dark:text-[#94a3b8] mt-0.5">{territory.region}</p>

          <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-gray-700 dark:text-[#f1f5f9]">
            {territory.municipalities.map((m, i) => (
              <li key={m.name} className="flex items-center gap-1">
                {i > 0 ? (
                  <span className="text-gray-300 dark:text-[#64748b]" aria-hidden="true">
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
            <p className="mt-2 text-[10px] text-gray-500 dark:text-[#94a3b8]">
              Punto amarillo: municipio PDET o ZOMAC
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm font-medium text-gray-700 dark:text-[#f1f5f9]">{name}</p>
      )}
    </div>
  );
}
