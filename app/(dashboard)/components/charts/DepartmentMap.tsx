"use client";

import {
  useEffect,
  useId,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { geoMercator, type ExtendedFeatureCollection, type GeoProjection } from "d3-geo";
import { ComposableMap, Geographies, Geography, type ProjectionFunction } from "react-simple-maps";
import { AggregationOption, DashboardQuestion } from "../../types";
import { toBarDatum } from "@/lib/dashboard/suppressedOption";
import {
  OUTSIDE_PROJECT_NOTE,
  PRIVACY_TOOLTIP,
  REGION_STROKE,
  accessibleRows,
  classifyDepartments,
  projectDepartments,
  projectFeatureCollection,
  tooltipText,
  unitFor,
  type ChartSource,
  type DepartmentCell,
  type DepartmentMapModel,
  type MapUnit,
} from "@/lib/dashboard/departmentMap";
import HorizontalBarChart from "./HorizontalBarChart";

/** Mismo GeoJSON que la landing. */
const GEO_URL = "/maps/colombia.geo.json";

/** Tamaño del lienzo SVG del mapa. */
const MAP_WIDTH = 380;
const MAP_HEIGHT = 400;
/** Margen interno entre la región del proyecto y el borde del lienzo. */
const MAP_PADDING = 16;

interface GeoData {
  geojson: ExtendedFeatureCollection;
  projection: GeoProjection;
}

/**
 * Spec 111 (D3): la proyección se ajusta con `fitExtent` a los seis
 * departamentos del proyecto, no al país entero; el resto de Colombia se
 * sigue dibujando (recortado por el lienzo) como contexto atenuado.
 */
function useProjectGeo(geoUrl: string): GeoData | null {
  const [data, setData] = useState<GeoData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(geoUrl)
      .then((res) => res.json())
      .then((geojson: ExtendedFeatureCollection) => {
        if (cancelled) return;
        const region = projectFeatureCollection(
          geojson as unknown as {
            type: "FeatureCollection";
            features: { properties: { DeNombre?: string } | null }[];
          },
        ) as unknown as ExtendedFeatureCollection;
        const projection = geoMercator().fitExtent(
          [
            [MAP_PADDING, MAP_PADDING],
            [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
          ],
          region,
        );
        setData({ geojson, projection });
      })
      .catch(() => {
        // Sin GeoJSON el mapa no se dibuja; la tabla y las barras siguen
        // mostrando los datos.
      });
    return () => {
      cancelled = true;
    };
  }, [geoUrl]);

  return data;
}

/** Rayas sobre el tono reservado de la rampa: marca la celda protegida. */
function ProtectedPattern({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill={color} />
      <line x1="0" y1="0" x2="0" y2="6" stroke="var(--border-strong)" strokeWidth="2" />
    </pattern>
  );
}

interface ActiveState {
  cell: DepartmentCell;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * El tooltip se abre hacia el lado con más espacio para no quedar recortado
 * por el borde del mapa (hallazgo de TC-111-005 con Caquetá, abajo a la derecha).
 */
const TOOLTIP_WIDTH = 200;

function tooltipPosition({ x, y, width, height }: ActiveState): React.CSSProperties {
  const OFFSET = 14;
  const EDGE = 4;
  const fitsRight = x + OFFSET + TOOLTIP_WIDTH <= width - EDGE;
  const left = fitsRight
    ? x + OFFSET
    : Math.max(EDGE, Math.min(x - OFFSET - TOOLTIP_WIDTH, width - EDGE - TOOLTIP_WIDTH));
  return {
    left,
    width: TOOLTIP_WIDTH,
    ...(y > height / 2 ? { bottom: height - y + OFFSET } : { top: y + OFFSET }),
  };
}

/**
 * «Sin unidades» dentro de la región: `--border-strong` a media opacidad, para
 * que se distinga de «fuera de la región» (`--surface-muted`) también en modo
 * oscuro (hallazgo de TC-111-002: con `--border` los dos grises casi se
 * confundían).
 */
const EMPTY_FILL = "var(--border-strong)";
const EMPTY_FILL_OPACITY = 0.5;
/** Barras de departamentos fuera de la región: neutras, fuera de la rampa (A3). */
const OUTSIDE_BAR_FILL = "var(--border-strong)";

/** Relleno y borde de cada estado. La rampa (valores) es fija; el resto usa tokens. */
function geographyStyle(cell: DepartmentCell, patternId: string, active: boolean) {
  const base = {
    outline: "none",
    transition: "fill 150ms ease, stroke-width 150ms ease",
  };
  if (!cell.inProject) {
    return {
      ...base,
      fill: "var(--surface-muted)",
      stroke: "var(--border)",
      strokeWidth: 0.5,
      pointerEvents: "none" as const,
    };
  }
  const fill =
    cell.state === "suppressed"
      ? `url(#${patternId})`
      : cell.state === "value"
        ? (cell.color as string)
        : EMPTY_FILL;
  return {
    ...base,
    fill,
    fillOpacity: cell.state === "empty" ? EMPTY_FILL_OPACITY : 1,
    // Borde ≥ 3:1 contra `--surface` en ambos temas: separa cada departamento
    // del fondo y de sus vecinos aunque el relleno de la rampa sea muy claro
    // (en claro) o muy oscuro (en oscuro). Decisión del usuario (2026-11-25).
    stroke: active ? "var(--text-primary)" : REGION_STROKE,
    strokeWidth: active ? 2 : 1.25,
    cursor: "default",
  };
}

interface DepartmentMapSvgProps {
  title: string;
  model: DepartmentMapModel;
  unit: MapUnit;
  patternId: string;
  suppressedColor: string;
}

function DepartmentMapSvg({ title, model, unit, patternId, suppressedColor }: DepartmentMapSvgProps) {
  const geo = useProjectGeo(GEO_URL);
  const [active, setActive] = useState<ActiveState | null>(null);
  // WCAG 1.4.13: el tooltip abierto por foco persiste aunque el puntero salga
  // del mapa, y Escape lo cierra sin mover el foco.
  const [focused, setFocused] = useState<ActiveState | null>(null);

  function clearPointer() {
    setActive(focused);
  }

  function positionFrom(container: HTMLElement | null, clientX: number, clientY: number) {
    const rect = container?.getBoundingClientRect();
    return {
      x: rect ? clientX - rect.left : 0,
      y: rect ? clientY - rect.top : 0,
      width: rect?.width ?? MAP_WIDTH,
      height: rect?.height ?? MAP_HEIGHT,
    };
  }

  function handleMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!active) return;
    const { x, y } = positionFrom(e.currentTarget, e.clientX, e.clientY);
    setActive((prev) => (prev ? { ...prev, x, y } : prev));
  }

  if (!geo) {
    return (
      <div
        style={{ width: MAP_WIDTH, height: MAP_HEIGHT, maxWidth: "100%" }}
        className="shrink-0 rounded-lg border border-[var(--border)] bg-surface"
      />
    );
  }

  const tip = active ? tooltipText(active.cell, unit) : null;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={clearPointer}
      className="relative w-full shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-surface"
      style={{ maxWidth: MAP_WIDTH }}
    >
      <ComposableMap
        // `react-simple-maps` usa la función recibida tal cual como proyección
        // ya construida (no la invoca como fábrica, pese a su tipo).
        projection={geo.projection as unknown as ProjectionFunction}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        role="group"
        aria-label={`Mapa de los departamentos del proyecto — ${title}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          {/* Celda protegida: tono más claro de la rampa con rayas, para no
              depender solo del color (WCAG 1.4.1). */}
          <ProtectedPattern id={patternId} color={suppressedColor} />
        </defs>
        <Geographies geography={geo.geojson}>
          {({ geographies }) => {
            // Los de fuera primero, para que el borde resaltado de la región
            // quede encima; los del proyecto en el orden de `territories`,
            // que es también el orden del recorrido con Tab.
            const order = (name: string) => {
              const i = projectDepartments().findIndex((p) => model.cellFor(name).name === p);
              return i === -1 ? -1 : i;
            };
            const sorted = [...geographies].sort(
              (a, b) => order(a.properties?.DeNombre ?? "") - order(b.properties?.DeNombre ?? ""),
            );
            return sorted.map((g) => {
              const name: string = g.properties?.DeNombre ?? "";
              const cell = model.cellFor(name);
              const isActive = active?.cell.name === cell.name;
              const style = geographyStyle(cell, patternId, isActive);
              const label = tooltipText(cell, unit);

              if (!cell.interactive) {
                return (
                  <Geography
                    key={g.rsmKey}
                    geography={g}
                    // `Geography` es enfocable por defecto (tabIndex 0): un
                    // departamento de fuera está oculto al lector de pantalla
                    // y no debe recibir foco (TC-111-006).
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{ default: style, hover: style, pressed: style }}
                  />
                );
              }

              const activate = (clientX: number, clientY: number, target: Element) => {
                const container = target.closest("div");
                setActive({ cell, ...positionFrom(container, clientX, clientY) });
              };

              return (
                <Geography
                  key={g.rsmKey}
                  geography={g}
                  tabIndex={0}
                  role="img"
                  aria-label={label ? `${label.title}: ${label.detail}` : name}
                  onMouseEnter={(e: ReactMouseEvent<SVGPathElement>) =>
                    activate(e.clientX, e.clientY, e.currentTarget)
                  }
                  onMouseLeave={clearPointer}
                  onFocus={(e: ReactFocusEvent<SVGPathElement>) => {
                    const box = e.currentTarget.getBoundingClientRect();
                    const container = e.currentTarget.closest("div");
                    const state = {
                      cell,
                      ...positionFrom(
                        container,
                        box.left + box.width / 2,
                        box.top + box.height / 2,
                      ),
                    };
                    setFocused(state);
                    setActive(state);
                  }}
                  onBlur={() => {
                    setFocused(null);
                    setActive(null);
                  }}
                  onKeyDown={(e: ReactKeyboardEvent<SVGPathElement>) => {
                    if (e.key === "Escape") setActive(null);
                  }}
                  style={{ default: style, hover: style, pressed: style }}
                />
              );
            });
          }}
        </Geographies>
      </ComposableMap>

      {tip && active && (
        // El nombre y el valor ya están en el `aria-label` del departamento
        // enfocado: el tooltip es solo visual.
        <div
          aria-hidden="true"
          style={tooltipPosition(active)}
          className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border)] bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-text-primary">{tip.title}</p>
          <p className="text-xs text-text-muted">{tip.detail}</p>
        </div>
      )}
    </div>
  );
}

interface MapLegendProps {
  model: DepartmentMapModel;
  unit: MapUnit;
  patternId: string;
}

function Swatch({ fill, border = "var(--border-strong)" }: { fill: string; border?: string }) {
  return (
    <svg aria-hidden="true" width="14" height="14" className="shrink-0">
      <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill={fill} stroke={border} />
    </svg>
  );
}

function MapLegend({ model, unit, patternId }: MapLegendProps) {
  const numbers = new Intl.NumberFormat("es-CO", { useGrouping: "always" });
  const hasSuppressed = model.cells.some((c) => c.state === "suppressed");
  const hasOutside = model.cells.some((c) => !c.inProject);
  return (
    <div className="space-y-2 text-[11px] text-text-muted">
      {model.legend.steps.length > 0 && (
        <div>
          <p className="mb-1">{unit.plural[0].toUpperCase() + unit.plural.slice(1)}</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1" role="list">
            {model.legend.steps.map((s) => (
              <li key={s.step} className="flex items-center gap-1">
                <Swatch fill={s.color} />
                {s.min === s.max
                  ? numbers.format(s.min)
                  : `${numbers.format(s.min)}–${numbers.format(s.max)}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="flex flex-wrap gap-x-3 gap-y-1" role="list">
        {hasSuppressed && (
          <li className="flex items-center gap-1">
            <svg aria-hidden="true" width="14" height="14" className="shrink-0">
              <defs>
                <ProtectedPattern id={`${patternId}-legend`} color={model.legend.suppressedColor} />
              </defs>
              <rect
                x="0.5"
                y="0.5"
                width="13"
                height="13"
                rx="2"
                fill={`url(#${patternId}-legend)`}
                stroke="var(--border-strong)"
              />
            </svg>
            Dato protegido
          </li>
        )}
        <li className="flex items-center gap-1">
          <svg aria-hidden="true" width="14" height="14" className="shrink-0">
            <rect
              x="0.5"
              y="0.5"
              width="13"
              height="13"
              rx="2"
              fill={EMPTY_FILL}
              fillOpacity={EMPTY_FILL_OPACITY}
              stroke="var(--border-strong)"
            />
          </svg>
          {unit.emptyLabel}
        </li>
        {hasOutside && (
          <li className="flex items-center gap-1">
            <Swatch fill="var(--surface-muted)" border="var(--border)" />
            {OUTSIDE_PROJECT_NOTE}
          </li>
        )}
      </ul>
      {hasSuppressed && <p>{model.legend.suppressedNote}.</p>}
    </div>
  );
}

interface DepartmentDataTableProps {
  title: string;
  model: DepartmentMapModel;
  unit: MapUnit;
}

/** C10: alternativa textual con todos los departamentos con dato. */
function DepartmentDataTable({ title, model, unit }: DepartmentDataTableProps) {
  const rows = accessibleRows(model, unit);
  if (rows.length === 0) return null;
  return (
    <details className="text-xs text-text-muted">
      <summary className="cursor-pointer select-none text-text-primary">
        Ver los datos en una tabla
      </summary>
      <table className="mt-2 w-full border-collapse text-left">
        <caption className="sr-only">{title} por departamento</caption>
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th scope="col" className="py-1 pr-2 font-medium">Departamento</th>
            <th scope="col" className="py-1 font-medium">Valor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.department} className="border-b border-[var(--border)] last:border-0">
              <th scope="row" className="py-1 pr-2 font-normal text-text-primary">
                {row.department}
                {row.note && <span className="text-text-muted"> ({row.note.toLowerCase()})</span>}
              </th>
              <td className="py-1">{row.valueText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

interface DepartmentMapProps {
  question: DashboardQuestion;
  /** Fuente del gráfico, para la unidad de los conteos (A2). */
  source?: ChartSource;
}

/**
 * Spec 66 (D6) + spec 111: mapa de calor de los departamentos del proyecto y
 * barras horizontales lado a lado, a partir de `aggregation.options` (una
 * pregunta de departamento o los buckets de una métrica por departamento).
 *
 * Spec 111: zoom a la región del proyecto, escala por pasos con leyenda,
 * estados protegido / sin datos / fuera del proyecto, tooltip por puntero y
 * teclado con la unidad de la fuente, y tabla accesible con los valores.
 */
export default function DepartmentMap({
  question,
  source = { sourceKind: "questions" },
}: DepartmentMapProps) {
  const patternId = `map-protected-${useId().replace(/:/g, "")}`;
  const options: AggregationOption[] =
    question.aggregation?.type === "single_choice" ? question.aggregation.options : [];

  // A lo sumo ~33 departamentos: no vale la pena memoizar.
  const model = classifyDepartments(
    options.map((o) => ({ name: o.text, count: o.count, suppressed: o.suppressed })),
  );
  const unit = unitFor(source);

  if (question.aggregation?.type !== "single_choice") return null;

  const barData = [...options]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map(toBarDatum);

  return (
    <figure className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
        <div className="flex w-full flex-col gap-2" style={{ maxWidth: MAP_WIDTH }}>
          <DepartmentMapSvg
            title={question.questionText}
            model={model}
            unit={unit}
            patternId={patternId}
            suppressedColor={model.legend.suppressedColor}
          />
          <MapLegend model={model} unit={unit} patternId={patternId} />
        </div>
        <div className="flex w-full flex-col justify-center" style={{ minHeight: MAP_HEIGHT }}>
          {/* Las barras usan el mismo color que el departamento en el mapa;
              las de fuera de la región, un neutro (A3). Las protegidas
              conservan el tratamiento común del dashboard (barra mínima, «—»). */}
          <HorizontalBarChart
            data={barData}
            yAxisWidth={160}
            colorForEntry={(entry) => model.cellFor(entry.name).color ?? OUTSIDE_BAR_FILL}
            // A1: la barra protegida no afirma «menos de 5»; la unidad es la de la fuente.
            formatTooltip={(entry) =>
              entry.suppressed
                ? PRIVACY_TOOLTIP
                : `${entry.percentage.toFixed(1)}% (${entry.count})`
            }
            tooltipLabel={unit.plural[0].toUpperCase() + unit.plural.slice(1)}
          />
        </div>
      </div>
      <figcaption>
        <DepartmentDataTable title={question.questionText} model={model} unit={unit} />
      </figcaption>
    </figure>
  );
}
