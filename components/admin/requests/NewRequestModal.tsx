"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-xl mx-4">

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle className="size-12 text-green-600" strokeWidth={1.5} />
            <div>
              <p className="text-base font-semibold text-[var(--text-primary)]">
                Solicitud enviada
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Tu reporte fue recibido. El administrador lo revisará próximamente.
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
              Reportar problema
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ChangeRequestCategory)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Describe el problema con el mayor detalle posible…"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50"
                />
                <p className="text-right text-xs text-[var(--text-muted)] mt-0.5">
                  {description.length}/2000
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-xs text-[var(--danger-fg)]">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || description.trim().length < 10}
                  className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
                >
                  {saving ? "Enviando…" : "Enviar reporte"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
