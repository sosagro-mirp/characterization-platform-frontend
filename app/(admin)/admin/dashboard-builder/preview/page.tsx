"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { BuilderChart, BuilderPreviewResult } from "@/app/(admin)/types";
import { chartGridSpan } from "@/lib/dashboard/chartHint";
import {
  listBuilderCharts,
  previewSavedChart,
} from "@/services/dashboard-builder.service";
import ChartPreview from "@/components/admin/dashboard-builder/ChartPreview";
import { StatusBadge, errorMessage } from "@/components/admin/dashboard-builder/ui";

type Audience = "public" | "private";

/**
 * Spec 109, Fase 2 — vista previa de una categoría completa como la vería
 * cada audiencia: el público solo ve gráficos públicos; el privado, ambos.
 * Con «Incluir borradores» se ven también los no publicados, marcados.
 */
export default function CategoryPreviewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const categoryId = params.get("categoryId") ?? "";
  const audience: Audience = params.get("audience") === "private" ? "private" : "public";
  const withDrafts = params.get("drafts") !== "false";

  const [charts, setCharts] = useState<BuilderChart[]>([]);
  const [previews, setPreviews] = useState<Record<string, BuilderPreviewResult>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function setQuery(next: Partial<{ audience: Audience; drafts: boolean }>) {
    const q = new URLSearchParams({ categoryId });
    q.set("audience", next.audience ?? audience);
    if (!(next.drafts ?? withDrafts)) q.set("drafts", "false");
    router.replace(`${pathname}?${q}`);
  }

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const all = await listBuilderCharts({ categoryId });
        const visible = all.filter(
          (c) =>
            (audience === "private" || c.audience === "public") &&
            (withDrafts || c.status === "published"),
        );
        const results = await Promise.all(
          visible.map(async (c) => [c.chartId, await previewSavedChart(c.chartId, audience)] as const),
        );
        if (cancelled) return;
        setCharts(visible);
        setPreviews(Object.fromEntries(results));
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "No se pudo generar la vista previa."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [audience, categoryId, withDrafts]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Link
        href={`/admin/dashboard-builder?categoryId=${categoryId}`}
        className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Volver al constructor
      </Link>
      <h1 className="text-2xl font-semibold">Vista previa de la categoría</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div role="group" aria-label="Audiencia" className="flex gap-2">
          {(["public", "private"] as const).map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={audience === a}
              onClick={() => setQuery({ audience: a })}
              className={`rounded-full px-3 py-1 ${audience === a ? "bg-brand text-brand-foreground" : "border border-[var(--border)]"}`}
            >
              {a === "public" ? "Como la ve el público" : "Como la ve el dashboard privado"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-green-700"
            checked={withDrafts}
            onChange={(e) => setQuery({ drafts: e.target.checked })}
          />
          Incluir borradores
        </label>
      </div>

      {error && <p className="text-sm text-[var(--danger-fg)]">{error}</p>}
      <div aria-busy={loading}>
        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">Generando…</p>
        ) : charts.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            Esta audiencia no vería ningún gráfico en esta categoría.
          </p>
        ) : (
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {charts.map((chart) => (
              <li
                key={chart.chartId}
                className={chartGridSpan(chart.layout) === 2 ? "md:col-span-2" : ""}
              >
                {chart.status === "draft" && (
                  <div className="mb-1">
                    <StatusBadge status="draft" />
                  </div>
                )}
                {previews[chart.chartId] && (
                  <ChartPreview
                    id={chart.chartId}
                    preview={previews[chart.chartId]}
                    meta={{
                      title: chart.title,
                      subtitle: chart.subtitle,
                      sourceKind: chart.sourceKind,
                      questionType: chart.questionType,
                      chartKind: chart.chartKind,
                      combineMode: chart.combineMode,
                      layout: chart.layout,
                      audience: chart.audience,
                    }}
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
