"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { geoMercator, type ExtendedFeatureCollection, type GeoProjection } from "d3-geo";
import { ComposableMap, Geographies, Geography, type ProjectionFunction } from "react-simple-maps";
import { AggregationOption, DashboardQuestion } from "../../types";
import { SUPPRESSED_TOOLTIP_LABEL, toBarDatum } from "@/lib/dashboard/suppressedOption";
import HorizontalBarChart from "./HorizontalBarChart";

/** Mismo GeoJSON que la landing y `ColombiaMap.tsx` (Resumen general) —
 * no se reutiliza `ColombiaMap` en sí porque esa fuente de datos
 * (`/api/dashboard/department-counts`) omite en silencio los departamentos
 * por debajo del umbral (D2), mientras que acá cada opción ya trae su
 * propio `suppressed: true` explícito que hay que distinguir visualmente
 * de "sin datos" — dos estados distintos, no uno. */
const GEO_URL = "/maps/colombia.geo.json";

/** Tamaño del lienzo SVG del mapa. */
const MAP_WIDTH = 380;
const MAP_HEIGHT = 400;
/** Margen interno mínimo entre el país y el borde del lienzo. */
const MAP_PADDING = 12;

/** Ajuste de estilo (2026-08-10): antes se afinaban `scale`/`center` a ojo
 * (`projectionConfig`) y siempre quedaba de sobra espacio en blanco
 * alrededor de Colombia dentro del lienzo fijo — sobre todo porque el
 * GeoJSON incluye San Andrés y Providencia, muy al noroeste, lo que obliga
 * a un lienzo ancho aunque el continente ocupe la mitad derecha. En vez de
 * seguir ajustando números a mano, se calcula la proyección con
 * `fitExtent` de `d3-geo` sobre el GeoJSON real — encuadra el contenido
 * exacto dentro de `[MAP_PADDING, MAP_WIDTH/HEIGHT - MAP_PADDING]`, sin
 * espacio de sobra más allá del margen mínimo fijado. */
function useFittedProjection(geoUrl: string): GeoProjection | null {
  const [projection, setProjection] = useState<GeoProjection | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(geoUrl)
      .then((res) => res.json())
      .then((geojson: ExtendedFeatureCollection) => {
        if (cancelled) return;
        const fitted = geoMercator().fitExtent(
          [
            [MAP_PADDING, MAP_PADDING],
            [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
          ],
          geojson,
        );
        setProjection(() => fitted);
      })
      .catch(() => {
        // Sin proyección ajustada, `ComposableMap` cae a su default
        // (`geoEqualEarth`, sin encuadre óptimo) — degradación aceptable,
        // no un estado de error que valga la pena mostrarle al usuario.
      });
    return () => {
      cancelled = true;
    };
  }, [geoUrl]);

  return projection;
}

/** Ajuste de estilo (2026-08-10): el extremo claro original (`#dcfce7`,
 * casi blanco) no tenía contraste suficiente contra el fondo blanco de la
 * tarjeta en tema claro (`--surface: #ffffff`) — los departamentos "sin
 * datos" se volvían casi invisibles. Se oscureció al tono emerald-200
 * (`#a7f3d0`), sigue siendo claramente el extremo más claro de la rampa
 * pero se distingue del fondo en ambos temas. */
const LIGHT_GREEN = { r: 167, g: 243, b: 208 };
const DARK_GREEN = { r: 20, g: 83, b: 45 };

/** Ajuste de estilo (2026-08-10): heatmap continuo a pedido del usuario —
 * "sin datos" (`ratio = 0`) ya no es un gris plano (`NO_DATA_FILL`) sino el
 * extremo más claro de la misma rampa verde, así la intensidad crece de
 * forma continua con la cantidad de encuestas. La única excepción es la
 * celda **suprimida por privacidad**: su conteo real es `null` a propósito
 * (D2) — incluirla en la escala continua revelaría por intensidad de color
 * la magnitud que la supresión existe para ocultar, así que se queda con
 * un color propio (ámbar) fuera de la escala, sin importar el ajuste. */
function densityColor(ratio: number): string {
  const r = Math.round(LIGHT_GREEN.r + (DARK_GREEN.r - LIGHT_GREEN.r) * ratio);
  const g = Math.round(LIGHT_GREEN.g + (DARK_GREEN.g - LIGHT_GREEN.g) * ratio);
  const b = Math.round(LIGHT_GREEN.b + (DARK_GREEN.b - LIGHT_GREEN.b) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

interface HoverState {
  name: string;
  option: AggregationOption | undefined;
  x: number;
  y: number;
}

interface DepartmentMapSvgProps {
  questionText: string;
  optionByName: Map<string, AggregationOption>;
  maxCount: number;
}

function DepartmentMapSvg({ questionText, optionByName, maxCount }: DepartmentMapSvgProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const projection = useFittedProjection(GEO_URL);

  function handleMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (!hover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHover((prev) =>
      prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : prev,
    );
  }

  if (!projection) {
    // Evita un flash con la proyección default (`geoEqualEarth`, sin
    // encuadre) mientras se calcula `fitExtent` — mismo tamaño de lienzo,
    // sin mapa dibujado todavía.
    return (
      <div
        style={{ width: MAP_WIDTH, height: MAP_HEIGHT, maxWidth: "100%" }}
        className="shrink-0 rounded-lg border border-[var(--border)] bg-surface"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Mapa de Colombia — ${questionText}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
      className="relative w-full shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-surface"
      style={{ maxWidth: MAP_WIDTH }}
    >
      <ComposableMap
        // Bug encontrado en verificación visual (2026-08-10): pese a que
        // `@types/react-simple-maps` tipa `projection` como
        // `(width, height, config) => GeoProjection` (una fábrica),
        // internamente solo hace `typeof projection === "function" ?
        // projection : ...` — si es función, la usa **tal cual** como la
        // proyección ya construida, sin invocarla. Envolverla en
        // `() => projection` (como sugiere el tipo) rompía todo: el
        // wrapper no tiene `.stream()`, de ahí "projectionStream is not a
        // function". Se pasa la instancia de `GeoProjection` directamente.
        projection={projection as unknown as ProjectionFunction}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties?.DeNombre ?? "";
              const option = optionByName.get(name);
              const fill = option?.suppressed
                ? "var(--warning-fg)"
                : densityColor((option?.count ?? 0) / maxCount);

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
                      option,
                      x: rect ? e.clientX - rect.left : 0,
                      y: rect ? e.clientY - rect.top : 0,
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    default: {
                      fill,
                      fillOpacity: option?.suppressed ? 0.5 : 1,
                      stroke: "var(--border)",
                      strokeWidth: 0.5,
                      outline: "none",
                      transition: "fill 150ms ease",
                    },
                    hover: {
                      fill,
                      fillOpacity: option?.suppressed ? 0.5 : 0.85,
                      stroke: "var(--border)",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill,
                      stroke: "var(--border)",
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

      {hover && (
        <div
          role="status"
          aria-live="polite"
          style={{ left: hover.x + 14, top: hover.y + 14 }}
          className="pointer-events-none absolute z-10 rounded-lg border border-[var(--border)] bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-text-primary">{hover.name}</p>
          <p className="text-xs text-text-muted">
            {hover.option?.suppressed
              ? SUPPRESSED_TOOLTIP_LABEL
              : hover.option?.count
                ? `${hover.option.count} encuestas`
                : "Sin datos"}
          </p>
        </div>
      )}
    </div>
  );
}

interface DepartmentMapProps {
  question: DashboardQuestion;
}

/**
 * Spec 66 (Fase 4, D6): mapa de Colombia + `HorizontalBarChart` lado a lado
 * en el mismo contenedor, a partir de `aggregation.options` de una pregunta
 * `single_choice` cuyas opciones son nombres de departamento (ej.
 * "Departamento" en C2, `chartHint: "map"`).
 *
 * Ajuste de estilo (2026-08-10, a pedido del usuario): agregado el
 * `HorizontalBarChart` junto al mapa, reutilizando el mismo componente
 * compartido y estilo que "Perfil del productor" / grupos-territorios (sin
 * ejes, un color por barra, porcentaje al final, sin resaltado de hover) en
 * vez de construir una tercera variante de barra para esta pregunta. El
 * mapa en sí también tuvo su propio ajuste (heatmap continuo, sin borde
 * resaltado — ver notas en `DepartmentMapSvg`).
 */
export default function DepartmentMap({ question }: DepartmentMapProps) {
  if (question.aggregation?.type !== "single_choice") return null;
  const options = question.aggregation.options;

  const optionByName = new Map(options.map((o) => [o.text, o]));
  const maxCount = Math.max(1, ...options.map((o) => o.count ?? 0));

  const barData = [...options]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map(toBarDatum);

  return (
    <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
      <DepartmentMapSvg
        questionText={question.questionText}
        optionByName={optionByName}
        maxCount={maxCount}
      />
      {/* Ajuste de estilo (2026-08-10): antes se forzaba `height={400}` para
       * igualar el alto del mapa, pero con solo 6 barras Recharts las
       * repartía a lo ancho de todo ese alto — quedaban muy separadas. Se
       * volvió al alto natural de `HorizontalBarChart` (compacto, filas de
       * 24px) y se centra ese bloque más chico dentro de un contenedor del
       * alto del mapa, en vez de estirar las barras para llenarlo. */}
      <div
        className="flex w-full flex-col justify-center"
        style={{ minHeight: MAP_HEIGHT }}
      >
        <HorizontalBarChart data={barData} yAxisWidth={160} />
      </div>
    </div>
  );
}
