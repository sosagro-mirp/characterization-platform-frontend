"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type {
  BuilderCatalogQuestion,
  BuilderCategory,
  BuilderChartPayload,
  BuilderEntityMetric,
  BuilderPreviewResult,
} from "@/app/(admin)/types";
import {
  allowedChartKinds,
  allowedCombineModes,
  chartKindLabel,
  commonQuestionType,
  optionsDifference,
  validateChartForm,
  type ChartCompatMatrix,
  type ChartFormField,
  type ChartSettings,
  type ChartSource,
  type CombineMode,
} from "@/lib/dashboard/chartCompat";
import { previewDraftChart } from "@/services/dashboard-builder.service";
import QuestionPicker, { questionTypeLabel } from "./QuestionPicker";
import ChartPreview from "./ChartPreview";
import {
  errorMessage,
  ghostButton,
  inputClass,
  labelClass,
  primaryButton,
} from "./ui";

export interface PickedSource extends ChartSource {
  text: string;
  instrumentName: string | null;
}

export interface SeriesState {
  seriesKey?: string;
  label: string;
  sources: PickedSource[];
}

export interface ChartFormState {
  title: string;
  subtitle: string;
  categoryId: string;
  audience: "public" | "private";
  layout: "normal" | "wide";
  sourceKind: "questions" | "entity_metric";
  metricKey: string;
  combineMode: CombineMode;
  chartKind: string;
  series: SeriesState[];
  settings: ChartSettings;
}

export function emptyChartForm(categoryId: string): ChartFormState {
  return {
    title: "",
    subtitle: "",
    categoryId,
    audience: "public",
    layout: "normal",
    sourceKind: "questions",
    metricKey: "",
    combineMode: "merge",
    chartKind: "",
    series: [{ label: "", sources: [] }],
    settings: {},
  };
}

export function pickedFromCatalog(q: BuilderCatalogQuestion): PickedSource {
  return {
    questionId: q.questionId,
    questionType: q.questionType,
    options: q.options ?? [],
    selectable: q.selectable,
    blockedReason: q.blockedReason,
    text: q.text,
    instrumentName: q.instrumentName,
  };
}

const OPTION_MATCH_TYPES = new Set(["single_choice", "multiple_choice", "compliance"]);

/** Ids de los controles, para llevar el foco al primer campo con error. */
const FIELD_IDS: Record<ChartFormField | "metricKey", string> = {
  // En el orden visual del formulario: el foco va al primero con error.
  metricKey: "chart-metric",
  combineMode: "chart-combine-merge",
  sources: "chart-sources",
  settings: "chart-settings",
  chartKind: "chart-kind",
  layout: "chart-layout-normal",
  title: "chart-title",
  categoryId: "chart-category",
  audience: "chart-audience-public",
};

interface ChartFormProps {
  initial: ChartFormState;
  categories: BuilderCategory[];
  matrix: ChartCompatMatrix;
  metrics: BuilderEntityMetric[];
  submitLabel: string;
  /** Aviso extra sobre el botón de guardar (p. ej. «se publica al guardar»). */
  saveNotice?: React.ReactNode;
  onSubmit: (payload: BuilderChartPayload) => Promise<void>;
}

type Errors = Partial<Record<ChartFormField | "metricKey", string>>;

function buildPayload(form: ChartFormState, questionType: string | null): BuilderChartPayload {
  const base = {
    categoryId: form.categoryId,
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || undefined,
    chartKind: form.chartKind,
    audience: form.audience,
    layout: form.layout,
  };
  if (form.sourceKind === "entity_metric") {
    return { ...base, sourceKind: "entity_metric", metricKey: form.metricKey, settings: {} };
  }
  const settings: Record<string, unknown> = {};
  if (form.settings.optionsMismatchAck) settings.optionsMismatchAck = true;
  if (questionType === "numeric_with_unit" && form.settings.numericWithUnit) {
    const nwu = form.settings.numericWithUnit;
    settings.numericWithUnit =
      nwu.strategy === "normalize"
        ? { strategy: "normalize", targetUnit: nwu.targetUnit, factors: nwu.factors ?? {} }
        : { strategy: "by_unit" };
  }
  return {
    ...base,
    sourceKind: "questions",
    combineMode: form.combineMode,
    settings,
    series: form.series.map((s, i) => ({
      seriesKey: s.seriesKey,
      label: s.label.trim() || (form.combineMode === "merge" ? base.title : `Serie ${i + 1}`),
      questionIds: s.sources.map((src) => src.questionId),
    })),
  };
}

function validate(
  form: ChartFormState,
  matrix: ChartCompatMatrix,
  metrics: BuilderEntityMetric[],
): Errors {
  if (form.sourceKind === "entity_metric") {
    const errors: Errors = {};
    if (!form.title.trim()) errors.title = "Escribe un título.";
    if (!form.categoryId) errors.categoryId = "Elige una categoría.";
    const metric = metrics.find((m) => m.metricKey === form.metricKey);
    if (!metric) errors.metricKey = "Elige una métrica.";
    else if (!metric.charts.includes(form.chartKind)) {
      errors.chartKind = "Elige un gráfico para la métrica.";
    }
    return errors;
  }
  const errors: Errors = {
    ...validateChartForm(
      {
        title: form.title,
        subtitle: form.subtitle,
        categoryId: form.categoryId,
        audience: form.audience,
        layout: form.layout,
        combineMode: form.combineMode,
        chartKind: form.chartKind,
        sources: form.series.flatMap((s) => s.sources),
        settings: form.settings,
      },
      { matrix },
    ).errors,
  };
  if (form.combineMode === "compare") {
    if (form.series.length < 2) errors.sources ??= "Una comparación necesita al menos dos series.";
    else if (form.series.some((s) => s.sources.length === 0)) {
      errors.sources ??= "Cada serie necesita al menos una pregunta.";
    }
  }
  return errors;
}

/**
 * Spec 109, Fase 2 — formulario de un gráfico: preguntas o métrica → series →
 * gráfico permitido por la matriz → título, categoría, audiencia y ancho.
 * Los errores aparecen tras el primer intento de guardar y el foco va al
 * primer campo inválido. La vista previa usa datos reales.
 */
export default function ChartForm({
  initial,
  categories,
  matrix,
  metrics,
  submitLabel,
  saveNotice,
  onSubmit,
}: ChartFormProps) {
  const [form, setForm] = useState<ChartFormState>(initial);
  const [activeSeries, setActiveSeries] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [preview, setPreview] = useState<BuilderPreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof ChartFormState>(key: K, value: ChartFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const allSources = useMemo(() => form.series.flatMap((s) => s.sources), [form.series]);
  const questionType = commonQuestionType(allSources);
  const metric = metrics.find((m) => m.metricKey === form.metricKey);

  const allowedKinds = useMemo(
    () =>
      form.sourceKind === "entity_metric"
        ? (metric?.charts ?? [])
        : allowedChartKinds(matrix, allSources, { combineMode: form.combineMode }),
    [allSources, form.combineMode, form.sourceKind, matrix, metric],
  );
  const combineModes = allowedCombineModes(matrix, questionType);

  // El gráfico elegido siempre es uno permitido: si deja de serlo, el primero (default).
  useEffect(() => {
    if (form.sourceKind === "questions" && questionType === "numeric_with_unit") return;
    if (!allowedKinds.includes(form.chartKind)) {
      setForm((f) => ({ ...f, chartKind: allowedKinds[0] ?? "" }));
    }
  }, [allowedKinds, form.chartKind, form.sourceKind, questionType]);

  const errors = validate(form, matrix, metrics);
  const isValid = Object.keys(errors).length === 0;
  const shown: Errors = attempted ? errors : {};

  // Vista previa automática con la configuración válida (sin guardar).
  const payloadKey = JSON.stringify(buildPayload(form, questionType));
  useEffect(() => {
    if (!isValid) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const result = await previewDraftChart(JSON.parse(payloadKey));
        if (!cancelled) setPreview(result);
      } catch (err) {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(errorMessage(err, "No se pudo generar la vista previa."));
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isValid, payloadKey]);

  function addSource(q: BuilderCatalogQuestion) {
    setForm((f) => {
      const series = f.series.map((s, i) =>
        i === Math.min(activeSeries, f.series.length - 1)
          ? { ...s, sources: [...s.sources, pickedFromCatalog(q)] }
          : s,
      );
      return { ...f, series, title: f.title || q.text.slice(0, 255) };
    });
  }

  function removeSource(seriesIndex: number, questionId: string) {
    setForm((f) => ({
      ...f,
      series: f.series.map((s, i) =>
        i === seriesIndex
          ? { ...s, sources: s.sources.filter((src) => src.questionId !== questionId) }
          : s,
      ),
    }));
  }

  function setCombineMode(mode: CombineMode) {
    setForm((f) => {
      if (mode === f.combineMode) return f;
      if (mode === "merge") {
        // Al volver a fusión, todas las preguntas quedan en una sola serie.
        return {
          ...f,
          combineMode: mode,
          series: [{ label: f.series[0]?.label ?? "", sources: f.series.flatMap((s) => s.sources) }],
        };
      }
      return { ...f, combineMode: mode };
    });
    setActiveSeries(0);
  }

  function setNumericStrategy(strategy: "by_unit" | "normalize") {
    setForm((f) => ({
      ...f,
      chartKind: strategy === "normalize" ? "histogram-normalized" : "histogram-by-unit",
      settings: {
        ...f.settings,
        numericWithUnit: { ...f.settings.numericWithUnit, strategy },
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    setSaveError(null);
    if (!isValid) {
      const first = (Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[]).find((k) => errors[k]);
      if (first) document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(buildPayload(form, questionType));
    } catch (err) {
      setSaveError(errorMessage(err, "No se pudo guardar el gráfico."));
    } finally {
      setSaving(false);
    }
  }

  const diff =
    form.combineMode === "merge" && questionType && OPTION_MATCH_TYPES.has(questionType)
      ? optionsDifference(allSources)
      : null;
  const units = [...new Set(allSources.flatMap((s) => s.options))];
  const nwu = form.settings.numericWithUnit;

  const errorText = (field: keyof Errors) =>
    shown[field] ? (
      <p id={`${FIELD_IDS[field]}-error`} className="mt-1 text-xs text-[var(--danger-fg)]">
        {shown[field]}
      </p>
    ) : null;
  const invalidProps = (field: keyof Errors) => ({
    "aria-invalid": shown[field] ? true : false,
    "aria-describedby": shown[field] ? `${FIELD_IDS[field]}-error` : undefined,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {/* 1. Origen de los datos */}
        <fieldset className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <legend className="px-1 text-sm font-semibold">1. Origen de los datos</legend>
          <div className="flex flex-wrap gap-4 text-sm">
            {(["questions", "entity_metric"] as const).map((kind) => (
              <label key={kind} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sourceKind"
                  className="accent-green-700"
                  checked={form.sourceKind === kind}
                  onChange={() => set("sourceKind", kind)}
                />
                {kind === "questions" ? "Preguntas de los instrumentos" : "Métrica de productores o fincas"}
              </label>
            ))}
          </div>

          {form.sourceKind === "entity_metric" ? (
            <div>
              <label htmlFor={FIELD_IDS.metricKey} className={labelClass}>
                Métrica
              </label>
              <select
                id={FIELD_IDS.metricKey}
                className={inputClass}
                value={form.metricKey}
                onChange={(e) => set("metricKey", e.target.value)}
                {...invalidProps("metricKey")}
              >
                <option value="">Elige una métrica…</option>
                {metrics.map((m) => (
                  <option key={m.metricKey} value={m.metricKey}>
                    {m.label}
                  </option>
                ))}
              </select>
              {errorText("metricKey")}
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Las métricas solo responden a los filtros de departamento, municipio y cultivo.
              </p>
            </div>
          ) : (
            <>
              {combineModes.includes("compare") && (
                <div role="radiogroup" aria-label="Cómo combinar las preguntas" className="flex flex-wrap gap-4 text-sm">
                  {(["merge", "compare"] as const).map((mode) => (
                    <label key={mode} className="flex items-center gap-2">
                      <input
                        id={mode === "merge" ? FIELD_IDS.combineMode : undefined}
                        type="radio"
                        name="combineMode"
                        className="accent-green-700"
                        checked={form.combineMode === mode}
                        onChange={() => setCombineMode(mode)}
                      />
                      {mode === "merge" ? "Fusionar en un solo gráfico" : "Comparar series lado a lado"}
                    </label>
                  ))}
                </div>
              )}
              {errorText("combineMode")}

              <div id={FIELD_IDS.sources} tabIndex={-1} className="flex flex-col gap-3 outline-none">
                {form.series.map((series, index) => (
                  <div
                    key={index}
                    className={`rounded-md border p-3 ${
                      form.combineMode === "compare" && index === activeSeries
                        ? "border-brand"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {form.combineMode === "compare" && (
                      <div className="mb-2 flex flex-wrap items-end gap-2">
                        <div className="min-w-40 flex-1">
                          <label htmlFor={`series-label-${index}`} className={labelClass}>
                            Nombre de la serie {index + 1}
                          </label>
                          <input
                            id={`series-label-${index}`}
                            className={inputClass}
                            value={series.label}
                            maxLength={255}
                            placeholder={`Serie ${index + 1}`}
                            onChange={(e) =>
                              set(
                                "series",
                                form.series.map((s, i) => (i === index ? { ...s, label: e.target.value } : s)),
                              )
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className={ghostButton}
                          aria-pressed={index === activeSeries}
                          onClick={() => setActiveSeries(index)}
                        >
                          {index === activeSeries ? "Agregando aquí" : "Agregar preguntas aquí"}
                        </button>
                        {form.series.length > 1 && (
                          <button
                            type="button"
                            className={ghostButton}
                            aria-label={`Quitar la serie ${index + 1}`}
                            onClick={() => {
                              set("series", form.series.filter((_, i) => i !== index));
                              setActiveSeries(0);
                            }}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    )}
                    {series.sources.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">Todavía no hay preguntas.</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {series.sources.map((src) => (
                          <li key={src.questionId} className="flex items-start gap-2 text-sm">
                            <span className="min-w-0 flex-1">
                              {src.text}
                              <span className="block text-xs text-[var(--text-muted)]">
                                {questionTypeLabel(src.questionType)} · {src.instrumentName ?? "—"}
                                {!src.selectable && ` · ${src.blockedReason ?? "bloqueada"}`}
                              </span>
                            </span>
                            <button
                              type="button"
                              className={ghostButton}
                              aria-label={`Quitar «${src.text}»`}
                              onClick={() => removeSource(index, src.questionId)}
                            >
                              <X size={16} aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {form.combineMode === "compare" && (
                  <button
                    type="button"
                    className={`${ghostButton} self-start`}
                    onClick={() => {
                      set("series", [...form.series, { label: "", sources: [] }]);
                      setActiveSeries(form.series.length);
                    }}
                  >
                    <Plus size={16} aria-hidden="true" /> Agregar serie
                  </button>
                )}
              </div>
              {errorText("sources")}

              {diff?.hasDifferences && (
                <div className="rounded-md bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
                  <p className="font-medium">Las preguntas no tienen las mismas opciones:</p>
                  <ul className="list-disc pl-5 text-xs">
                    {Object.entries(diff.onlyIn).map(([id, opts]) => (
                      <li key={id}>
                        Solo en «{allSources.find((s) => s.questionId === id)?.text ?? id}»: {opts.join(", ")}
                      </li>
                    ))}
                  </ul>
                  <label className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-green-700"
                      checked={form.settings.optionsMismatchAck === true}
                      onChange={(e) =>
                        set("settings", { ...form.settings, optionsMismatchAck: e.target.checked })
                      }
                    />
                    Entiendo la diferencia y quiero fusionarlas igual.
                  </label>
                </div>
              )}

              <QuestionPicker
                selectedIds={new Set(allSources.map((s) => s.questionId))}
                lockedType={questionType}
                onAdd={addSource}
              />
            </>
          )}
        </fieldset>

        {/* 2. Gráfico */}
        <fieldset className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <legend className="px-1 text-sm font-semibold">2. Gráfico</legend>
          {form.sourceKind === "questions" && questionType === "numeric_with_unit" ? (
            <div id={FIELD_IDS.settings} tabIndex={-1} className="flex flex-col gap-3 outline-none">
              <div role="radiogroup" aria-label="Cómo tratar las unidades" className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="nwu-strategy"
                    className="accent-green-700"
                    checked={nwu?.strategy === "by_unit"}
                    onChange={() => setNumericStrategy("by_unit")}
                  />
                  Un histograma por unidad (sin convertir)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="nwu-strategy"
                    className="accent-green-700"
                    checked={nwu?.strategy === "normalize"}
                    onChange={() => setNumericStrategy("normalize")}
                  />
                  Convertir todo a una unidad
                </label>
              </div>
              {nwu?.strategy === "normalize" && (
                <div className="flex flex-col gap-2">
                  <div>
                    <label htmlFor="nwu-target" className={labelClass}>
                      Unidad destino
                    </label>
                    <select
                      id="nwu-target"
                      className={inputClass}
                      value={nwu.targetUnit ?? ""}
                      onChange={(e) =>
                        set("settings", {
                          ...form.settings,
                          numericWithUnit: { ...nwu, targetUnit: e.target.value },
                        })
                      }
                    >
                      <option value="">Elige…</option>
                      {units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  {nwu.targetUnit &&
                    units.map((u) => (
                      <div key={u} className="flex items-center gap-2 text-sm">
                        <label htmlFor={`factor-${u}`} className="w-40 shrink-0">
                          1 {u} =
                        </label>
                        <input
                          id={`factor-${u}`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          className={`${inputClass} w-32`}
                          value={nwu.factors?.[u] ?? (u === nwu.targetUnit ? 1 : "")}
                          onChange={(e) => {
                            const factors = { ...(nwu.factors ?? {}) };
                            if (e.target.value === "") delete factors[u];
                            else factors[u] = Number(e.target.value);
                            set("settings", {
                              ...form.settings,
                              numericWithUnit: { ...nwu, factors },
                            });
                          }}
                        />
                        <span>{nwu.targetUnit}</span>
                      </div>
                    ))}
                  <p className="text-xs text-[var(--text-muted)]">
                    Las respuestas en una unidad sin factor quedan fuera del gráfico.
                  </p>
                </div>
              )}
              {errorText("settings")}
            </div>
          ) : (
            <div>
              <label htmlFor={FIELD_IDS.chartKind} className={labelClass}>
                Tipo de gráfico
              </label>
              <select
                id={FIELD_IDS.chartKind}
                className={inputClass}
                value={form.chartKind}
                disabled={allowedKinds.length === 0}
                onChange={(e) => set("chartKind", e.target.value)}
                {...invalidProps("chartKind")}
              >
                {allowedKinds.length === 0 && (
                  <option value="">
                    {form.sourceKind === "questions"
                      ? "Elige preguntas para ver los gráficos posibles"
                      : "Elige una métrica"}
                  </option>
                )}
                {allowedKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {chartKindLabel(kind)}
                  </option>
                ))}
              </select>
              {errorText("chartKind")}
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Solo aparecen los gráficos que admiten estas preguntas.
              </p>
            </div>
          )}

          <fieldset className="flex flex-wrap gap-4 text-sm">
            <legend className={labelClass}>Ancho en el dashboard</legend>
            {(["normal", "wide"] as const).map((layout) => (
              <label key={layout} className="flex items-center gap-2">
                <input
                  id={layout === "normal" ? FIELD_IDS.layout : undefined}
                  type="radio"
                  name="layout"
                  className="accent-green-700"
                  checked={form.layout === layout}
                  onChange={() => set("layout", layout)}
                />
                {layout === "normal" ? "Normal (una columna)" : "Ancho (dos columnas)"}
              </label>
            ))}
          </fieldset>
        </fieldset>

        {/* 3. Presentación */}
        <fieldset className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <legend className="px-1 text-sm font-semibold">3. Presentación y publicación</legend>
          <div>
            <label htmlFor={FIELD_IDS.title} className={labelClass}>
              Título <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <input
              id={FIELD_IDS.title}
              className={inputClass}
              value={form.title}
              maxLength={255}
              required
              onChange={(e) => set("title", e.target.value)}
              {...invalidProps("title")}
            />
            {errorText("title")}
          </div>
          <div>
            <label htmlFor="chart-subtitle" className={labelClass}>
              Subtítulo
            </label>
            <input
              id="chart-subtitle"
              className={inputClass}
              value={form.subtitle}
              maxLength={500}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={FIELD_IDS.categoryId} className={labelClass}>
              Categoría <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <select
              id={FIELD_IDS.categoryId}
              className={inputClass}
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              {...invalidProps("categoryId")}
            >
              <option value="">Elige…</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.code} · {c.name}
                  {c.isActive ? "" : " (inactiva)"}
                </option>
              ))}
            </select>
            {errorText("categoryId")}
          </div>
          <fieldset className="flex flex-wrap gap-4 text-sm">
            <legend className={labelClass}>Audiencia</legend>
            {(["public", "private"] as const).map((audience) => (
              <label key={audience} className="flex items-center gap-2">
                <input
                  id={audience === "public" ? FIELD_IDS.audience : undefined}
                  type="radio"
                  name="audience"
                  className="accent-green-700"
                  checked={form.audience === audience}
                  onChange={() => set("audience", audience)}
                />
                {audience === "public"
                  ? "Pública (dashboard abierto)"
                  : "Privada (solo administradores e investigadores)"}
              </label>
            ))}
          </fieldset>
        </fieldset>

        {saveNotice}
        {saveError && (
          <p role="alert" className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
            {saveError}
          </p>
        )}
        <div className="flex justify-end">
          <button type="submit" className={primaryButton} disabled={saving}>
            {saving ? "Guardando…" : submitLabel}
          </button>
        </div>
      </form>

      <aside aria-labelledby={previewId} className="lg:sticky lg:top-0 lg:self-start">
        <h2 id={previewId} className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Vista previa
        </h2>
        <p role="status" className="sr-only">
          {previewLoading ? "Actualizando vista previa…" : preview ? "Vista previa actualizada." : ""}
        </p>
        <div aria-busy={previewLoading}>
          {previewError ? (
            <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
              {previewError}
            </p>
          ) : preview ? (
            <ChartPreview
              id="draft"
              preview={preview}
              meta={{
                title: form.title,
                subtitle: form.subtitle,
                sourceKind: form.sourceKind,
                questionType,
                chartKind: form.chartKind,
                combineMode: form.combineMode,
                layout: form.layout,
                audience: form.audience,
              }}
            />
          ) : (
            <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              {previewLoading
                ? "Generando vista previa…"
                : "Completa el formulario para ver el gráfico con datos reales."}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
