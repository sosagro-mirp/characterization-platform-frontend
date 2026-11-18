"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import type { BuilderChart, BuilderChartEvent } from "@/app/(admin)/types";
import {
  builderChartAction,
  getBuilderChart,
  getBuilderChartEvents,
  searchBuilderQuestions,
  updateBuilderChart,
  type BuilderChartAction,
} from "@/services/dashboard-builder.service";
import ChartForm, {
  pickedFromCatalog,
  type ChartFormState,
  type PickedSource,
} from "@/components/admin/dashboard-builder/ChartForm";
import EventHistory from "@/components/admin/dashboard-builder/EventHistory";
import { useBuilderCatalogs } from "@/components/admin/dashboard-builder/useBuilderCatalogs";
import {
  AudienceBadge,
  CacheNotice,
  ConfirmModal,
  HealthBadge,
  StatusBadge,
  errorMessage,
  secondaryButton,
} from "@/components/admin/dashboard-builder/ui";

/** Estado del formulario a partir de un gráfico guardado y del catálogo de sus fuentes. */
async function formFromChart(chart: BuilderChart): Promise<ChartFormState> {
  const ids = chart.series.flatMap((s) => s.sources.map((src) => src.questionId));
  const catalog = ids.length
    ? await searchBuilderQuestions({ ids, limit: ids.length })
    : [];
  const byId = new Map(catalog.map((q) => [q.questionId, pickedFromCatalog(q)]));
  return {
    title: chart.title,
    subtitle: chart.subtitle ?? "",
    categoryId: chart.categoryId,
    audience: chart.audience,
    layout: chart.layout,
    sourceKind: chart.sourceKind,
    metricKey: chart.metricKey ?? "",
    combineMode: chart.combineMode,
    chartKind: chart.chartKind,
    settings: chart.settings ?? {},
    series: chart.series.length
      ? chart.series.map((s) => ({
          seriesKey: s.seriesKey,
          label: s.label,
          sources: s.sources.map(
            (src): PickedSource =>
              byId.get(src.questionId) ?? {
                // La pregunta ya no existe: se muestra con su texto guardado y bloqueada.
                questionId: src.questionId,
                questionType: chart.questionType ?? "",
                options: [],
                selectable: false,
                blockedReason: "La pregunta ya no existe.",
                text: src.questionTextSnapshot,
                instrumentName: src.instrumentCodeSnapshot,
              },
          ),
        }))
      : [{ label: "", sources: [] }],
  };
}

/** Spec 109, Fase 2 — editar un gráfico, publicarlo y ver su historial. */
export default function EditChartPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { catalogs, error: catalogsError } = useBuilderCatalogs();
  const [chart, setChart] = useState<BuilderChart | null>(null);
  const [initial, setInitial] = useState<ChartFormState | null>(null);
  const [events, setEvents] = useState<BuilderChartEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState<BuilderChartAction | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  const fetchChart = useCallback(async () => {
    const loaded = await getBuilderChart(id);
    const [form, history] = await Promise.all([formFromChart(loaded), getBuilderChartEvents(id)]);
    return { loaded, form, history };
  }, [id]);

  const apply = useCallback(
    ({ loaded, form, history }: Awaited<ReturnType<typeof fetchChart>>) => {
      setChart(loaded);
      setInitial(form);
      setEvents(history);
      setFormVersion((v) => v + 1);
    },
    [],
  );

  const load = useCallback(async () => {
    try {
      apply(await fetchChart());
    } catch (err) {
      setError(errorMessage(err, "No se pudo cargar el gráfico."));
    }
  }, [apply, fetchChart]);

  useEffect(() => {
    let cancelled = false;
    fetchChart()
      .then((result) => {
        if (!cancelled) apply(result);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "No se pudo cargar el gráfico."));
      });
    return () => {
      cancelled = true;
    };
  }, [apply, fetchChart]);

  async function act(action: BuilderChartAction) {
    setError(null);
    try {
      const result = await builderChartAction(id, action);
      if (action === "duplicate" && result.chartId) {
        router.push(`/admin/dashboard-builder/charts/${result.chartId}`);
        return;
      }
      setStatus(
        {
          publish: "Gráfico publicado.",
          unpublish: "Gráfico despublicado.",
          archive: "Gráfico archivado.",
          restore: "Gráfico restaurado.",
          duplicate: "",
        }[action],
      );
      await load();
    } catch (err) {
      setError(errorMessage(err, "No se pudo completar la acción."));
    }
  }

  const back = chart ? `/admin/dashboard-builder?categoryId=${chart.categoryId}` : "/admin/dashboard-builder";
  const published = chart?.status === "published" && !chart.archivedAt;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Link href={back} className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Volver al constructor
      </Link>
      <p role="status" className="sr-only">
        {status}
      </p>
      {(error || catalogsError) && (
        <p role="alert" className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error ?? catalogsError}
        </p>
      )}
      {chart && (
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{chart.title}</h1>
            <StatusBadge status={chart.status} />
            <AudienceBadge audience={chart.audience} />
            <HealthBadge health={chart.health} />
            {chart.archivedAt && (
              <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs">Archivado</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {chart.archivedAt ? (
              <button type="button" className={secondaryButton} onClick={() => act("restore")}>
                Restaurar
              </button>
            ) : chart.status === "draft" ? (
              <button type="button" className={secondaryButton} onClick={() => act("publish")}>
                Publicar
              </button>
            ) : (
              <button type="button" className={secondaryButton} onClick={() => setConfirm("unpublish")}>
                Despublicar
              </button>
            )}
            <button type="button" className={secondaryButton} onClick={() => act("duplicate")}>
              Duplicar
            </button>
            {!chart.archivedAt && (
              <button type="button" className={secondaryButton} onClick={() => setConfirm("archive")}>
                Archivar
              </button>
            )}
          </div>
        </header>
      )}
      {chart?.health === "needs_review" && (
        <p className="flex items-start gap-2 rounded-md bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          Alguna pregunta de este gráfico ya no se puede usar (cambió de tipo, quedó bloqueada por
          privacidad o se borró). El dashboard la omite; si no queda ninguna válida, el gráfico no se
          muestra. Quítala o reemplázala.
        </p>
      )}
      {published && <CacheNotice />}

      {chart && initial && catalogs ? (
        <ChartForm
          key={formVersion}
          initial={initial}
          categories={catalogs.categories}
          matrix={catalogs.matrix}
          metrics={catalogs.metrics}
          submitLabel={published ? "Guardar y publicar cambios" : "Guardar cambios"}
          saveNotice={
            published ? (
              <p className="rounded-md bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
                Este gráfico está publicado: al guardar, los cambios se ven en el dashboard.
              </p>
            ) : undefined
          }
          onSubmit={async (payload) => {
            await updateBuilderChart(id, payload);
            setStatus("Cambios guardados.");
            await load();
          }}
        />
      ) : (
        !error && <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      )}

      {chart && (
        <section aria-labelledby="history-title" className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 id="history-title" className="mb-2 text-lg font-semibold">
            Historial
          </h2>
          <EventHistory events={events} />
        </section>
      )}

      <ConfirmModal
        open={confirm !== null}
        title={confirm === "archive" ? "¿Archivar este gráfico?" : "¿Despublicar este gráfico?"}
        description="Dejará de verse en el dashboard."
        confirmLabel={confirm === "archive" ? "Archivar" : "Despublicar"}
        destructive
        onConfirm={() => {
          const action = confirm;
          setConfirm(null);
          if (action) act(action);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
