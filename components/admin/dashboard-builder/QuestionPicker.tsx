"use client";

import { useEffect, useId, useState } from "react";
import { Lock, Plus, Search } from "lucide-react";
import type { BuilderCatalogQuestion } from "@/app/(admin)/types";
import { questionBlockReason } from "@/lib/dashboard/chartCompat";
import { searchBuilderQuestions } from "@/services/dashboard-builder.service";
import { errorMessage, ghostButton, inputClass, labelClass, PrivateOnlyBadge } from "./ui";

const TYPE_LABELS: Record<string, string> = {
  yes_no: "Sí/No",
  single_choice: "Selección única",
  multiple_choice: "Selección múltiple",
  compliance: "Cumplimiento",
  likert: "Likert",
  numeric: "Numérica",
  numeric_with_unit: "Numérica con unidad",
  open_text: "Texto abierto",
};

export function questionTypeLabel(type: string | null | undefined): string {
  return (type && TYPE_LABELS[type]) ?? type ?? "—";
}

interface QuestionPickerProps {
  /** Preguntas ya elegidas en el gráfico (no se pueden repetir). */
  selectedIds: Set<string>;
  /** Tipo de las fuentes ya elegidas: las de otro tipo se marcan como incompatibles. */
  lockedType: string | null;
  /** Audiencia elegida: con «Pública», las fuentes de dato sensible avisan que hay que pasar a privada. */
  audience: "public" | "private";
  onAdd: (question: BuilderCatalogQuestion) => void;
}

/**
 * Buscador del catálogo de preguntas (spec 108). Las bloqueadas por
 * privacidad o por tipo se listan con su motivo y no se pueden agregar
 * (criterio 11).
 */
export default function QuestionPicker({ selectedIds, lockedType, audience, onAdd }: QuestionPickerProps) {
  const inputId = useId();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<BuilderCatalogQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const term = search.trim();
    if (term.length < 3) {
      setResults([]);
      setStatus("");
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await searchBuilderQuestions({ search: term, limit: 40 });
        if (cancelled) return;
        setResults(rows);
        setStatus(
          rows.length === 0
            ? "Sin resultados."
            : `${rows.length} pregunta${rows.length === 1 ? "" : "s"} encontrada${rows.length === 1 ? "" : "s"}.`,
        );
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "No se pudo buscar."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className={labelClass}>
        Buscar preguntas por texto
      </label>
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          id={inputId}
          type="search"
          className={`${inputClass} pl-9`}
          value={search}
          placeholder="Al menos 3 letras, p. ej. «crédito»"
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>
      <p role="status" className="text-xs text-[var(--text-muted)]">
        {loading ? "Buscando…" : status}
      </p>
      {error && <p className="text-sm text-[var(--danger-fg)]">{error}</p>}
      {results.length > 0 && (
        <ul className="flex max-h-80 flex-col divide-y divide-[var(--border)] overflow-y-auto rounded-md border border-[var(--border)]">
          {results.map((q) => {
            const blocked = questionBlockReason(q);
            const already = selectedIds.has(q.questionId);
            const otherType =
              !blocked && lockedType !== null && q.questionType !== lockedType
                ? `Es de tipo «${questionTypeLabel(q.questionType)}»; las elegidas son «${questionTypeLabel(lockedType)}».`
                : null;
            const reason = blocked ?? otherType;
            return (
              <li key={q.questionId} className="flex items-start gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--text-primary)]">{q.text}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {questionTypeLabel(q.questionType)} · {q.instrumentName ?? "Sin instrumento"}
                    {q.sectionName ? ` · ${q.sectionName}` : ""}
                    {q.archivedAt ? " · archivada" : ""}
                  </p>
                  {reason && (
                    <p className="mt-1 flex items-start gap-1 text-xs text-[var(--warning-fg)]">
                      <Lock size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                      {reason}
                    </p>
                  )}
                  {!blocked && q.privateOnlyReason && (
                    <>
                      <PrivateOnlyBadge reason={q.privateOnlyReason} />
                      {audience === "public" && (
                        <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                          Para usarla, cambia la audiencia del gráfico a «Privada».
                        </span>
                      )}
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className={ghostButton}
                  disabled={!!reason || already}
                  onClick={() => onAdd(q)}
                  aria-label={already ? `«${q.text}» ya está en el gráfico` : `Agregar «${q.text}»`}
                >
                  <Plus size={16} aria-hidden="true" />
                  {already ? "Agregada" : "Agregar"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
