"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarDatum, formatBarTooltip } from "@/lib/dashboard/suppressedOption";
import { CATEGORICAL_BAR_COLORS } from "@/lib/dashboard/palette";

/** Margen derecho fijo del `<BarChart>` — reservado para que quepa la
 * etiqueta más larga posible ("100% (999)") sin salirse del contenedor.
 * Bug encontrado en verificación visual (2026-08-10): con `MARGIN_RIGHT=48`
 * y el texto creciendo hacia la derecha desde ese borde (`textAnchor`
 * default = "start"), la etiqueta se salía del contenedor — se subió el
 * margen y se ancló el texto por su extremo derecho (`textAnchor="end"`)
 * en vez de por el izquierdo. */
const MARGIN_RIGHT = 72;

/** Recharts pasa `index` en las props del label (no está en sus tipos
 * públicos) — se usa para volver a `data[index]` y distinguir una celda
 * suprimida, ya que un `formatter` de `LabelList` solo recibe el valor
 * numérico (el placeholder), no el dato completo. Una celda suprimida
 * muestra "—" en vez del porcentaje falso. */
interface PercentageLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  index?: number;
}

/**
 * Ajuste de estilo (2026-08-10): la etiqueta ya no va pegada a la punta de
 * cada barra (`x + width`, variable según el valor) sino alineada al borde
 * derecho fijo del contenedor — todas las etiquetas quedan en la misma
 * columna vertical, no persiguiendo el largo de cada barra. `containerWidth`
 * se mide con `ResizeObserver` en el componente padre; mientras es `null`
 * (primer render, antes de medir) cae al comportamiento anterior para no
 * mostrar nada corrido o superpuesto.
 */
function renderPercentageLabel(data: BarDatum[], containerWidth: number | null) {
  return function PercentageLabel(props: PercentageLabelProps) {
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const width = Number(props.width ?? 0);
    const height = Number(props.height ?? 0);
    const { index } = props;
    const datum = typeof index === "number" ? data[index] : undefined;
    if (!datum) return null;
    // Ajuste de estilo (2026-08-10): cantidad de respuestas entre paréntesis
    // junto al porcentaje — mismo criterio que la leyenda de `DonutChart`.
    const text = datum.suppressed
      ? "—"
      : `${datum.percentage.toFixed(0)}% (${datum.count ?? 0})`;
    // Ancorado por el extremo derecho del texto (`textAnchor="end"`) cuando
    // ya se conoce el ancho del contenedor, así el texto crece hacia la
    // izquierda desde el borde en vez de salirse por la derecha. Antes de
    // medir (`containerWidth === null`) cae al comportamiento anterior,
    // pegado a la punta de la barra.
    const labelX = containerWidth !== null ? containerWidth - 4 : x + width + 6;
    const textAnchor = containerWidth !== null ? "end" : "start";
    return (
      <text
        x={labelX}
        y={y + height / 2}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fontSize={11}
        fill="var(--text-muted)"
      >
        {text}
      </text>
    );
  };
}

function defaultColorForEntry(_entry: BarDatum, index: number): string {
  return CATEGORICAL_BAR_COLORS[index % CATEGORICAL_BAR_COLORS.length];
}

/** Ajuste de estilo (2026-08-05): el nombre de la opción en el eje se corta
 * a 18 caracteres con puntos suspensivos; el texto completo queda
 * disponible al pasar el mouse (`<title>` nativo del SVG). */
const CATEGORY_LABEL_MAX_LENGTH = 18;

function truncateCategoryLabel(text: string): string {
  return text.length > CATEGORY_LABEL_MAX_LENGTH
    ? `${text.slice(0, CATEGORY_LABEL_MAX_LENGTH)}…`
    : text;
}

interface CategoryTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string };
}

function CategoryTick({ x = 0, y = 0, payload }: CategoryTickProps) {
  const fullText = payload?.value ?? "";
  return (
    <text
      x={Number(x)}
      y={Number(y)}
      dy={4}
      textAnchor="end"
      fontSize={11}
      fill="var(--text-muted)"
    >
      <title>{fullText}</title>
      {truncateCategoryLabel(fullText)}
    </text>
  );
}

interface HorizontalBarChartProps {
  data: BarDatum[];
  /** Color por barra normal (no suprimida); default: paleta categórica
   * cíclica por posición. `ComplianceChart` pasa su propio semáforo. */
  colorForEntry?: (entry: BarDatum, index: number) => string;
  yAxisWidth?: number;
  /** Alto explícito en px; por default se calcula por cantidad de filas
   * (`data.length * 24`, mínimo 120). `DepartmentMap` lo fuerza a un valor
   * mayor para que la barra iguale la altura visual del mapa contiguo. */
  height?: number;
}

/**
 * Spec 66 (Fase 3, ajuste de estilo 2026-08-05): gráfica de barras
 * horizontal compartida — mismo look para toda pregunta de selección única
 * o múltiple (rediseño según mockup de "Etapas de la cadena", extraído acá
 * cuando el usuario pidió el mismo estilo para "Perfil del productor" para
 * no duplicar el código una segunda vez). Un color por barra, pista de
 * fondo en vez de grilla/eje visibles, porcentaje como etiqueta fija al
 * final de la barra, celdas suprimidas por privacidad en "—".
 */
export default function HorizontalBarChart({
  data,
  colorForEntry = defaultColorForEntry,
  yAxisWidth = 140,
  height: explicitHeight,
}: HorizontalBarChartProps) {
  // Ajuste de estilo (2026-08-05): menos separación entre barras — el alto
  // por fila bajó de 36 a 24 (el grosor de la barra, `barSize={14}` más
  // abajo, no cambió: lo que se achica es el espacio entre una y otra).
  const height = explicitHeight ?? Math.max(120, data.length * 24);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 8, right: MARGIN_RIGHT, top: 4, bottom: 4 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={yAxisWidth}
            tick={CategoryTick}
            axisLine={false}
            tickLine={false}
            // Bug encontrado en verificación visual (2026-08-05): con un tick
            // custom, Recharts no puede medir su tamaño real y por defecto
            // aplica su lógica de "saltar ticks que se solaparían" — ocultaba
            // 1 de cada 2 etiquetas (fila 1 y 3) aunque había espacio de sobra.
            // interval={0} fuerza a mostrar las 4 siempre.
            interval={0}
          />
          <Tooltip
            cursor={false}
            formatter={(_value, _name, item) => [
              formatBarTooltip(item.payload as BarDatum),
              "Respuestas",
            ]}
          />
          <Bar
            dataKey="percentage"
            radius={[4, 4, 4, 4]}
            barSize={14}
            background={{ fill: "var(--surface-muted)", radius: 4 }}
          >
            <LabelList
              dataKey="percentage"
              content={renderPercentageLabel(data, containerWidth)}
            />
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={
                  entry.suppressed ? "var(--warning-fg)" : colorForEntry(entry, index)
                }
                fillOpacity={entry.suppressed ? 0.5 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
