"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { createRequest } from "@/services/change-requests.service";
import type { ChangeRequestCategory } from "@/app/(admin)/types";

const CATEGORIES: { value: ChangeRequestCategory; label: string }[] = [
  { value: "bug_ui", label: "Bug de UI / interfaz" },
  { value: "data_error", label: "Error en datos" },
  { value: "suggestion", label: "Sugerencia" },
  { value: "other", label: "Otro" },
];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function NewRequestModal({ onClose, onCreated }: Props) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ChangeRequestCategory>("bug_ui");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(onCreated, 2000);
    return () => clearTimeout(t);
  }, [submitted, onCreated]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 10) return;
    setSaving(true);
    setError(null);
    try {
      await createRequest({ description: description.trim(), category });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la solicitud.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Reportar un problema
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle className="size-12 text-[var(--success-fg)]" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Solicitud enviada
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Tu reporte fue recibido. El administrador lo revisará próximamente.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ChangeRequestCategory)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label className="text-xs text-[var(--text-muted)]">Descripción</label>
                  <span
                    className={`text-[10.5px] ${description.length > 1800 ? "text-[var(--warning-fg)]" : "text-[var(--text-muted)]"}`}
                  >
                    {description.length} / 2000
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Contanos qué ocurrió, en qué pantalla y con qué instrumento o campaña."
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50"
                />
              </div>

              {error && (
                <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-xs text-[var(--danger-fg)]">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || description.trim().length < 10}
                  className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
                >
                  {saving ? "Enviando…" : "Enviar reporte"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
