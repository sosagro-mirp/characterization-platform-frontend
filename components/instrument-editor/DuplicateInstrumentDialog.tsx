"use client";

import { useEffect, useState } from "react";
import { InstrumentListItem } from "@/app/(admin)/types";
import { duplicateInstrument } from "@/services/instruments.service";

interface DuplicateInstrumentDialogProps {
  instrument: InstrumentListItem | null;
  onClose: () => void;
  onDuplicated: (created: InstrumentListItem) => void;
}

export default function DuplicateInstrumentDialog({
  instrument,
  onClose,
  onDuplicated,
}: DuplicateInstrumentDialogProps) {
  const [name, setName] = useState("");
  const [version, setVersion] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Precarga nombre y versión cada vez que se abre el diálogo para un
  // instrumento distinto (o se reabre para el mismo, tras cerrarlo).
  useEffect(() => {
    if (instrument) {
      setName(`${instrument.name} (copia)`);
      setVersion(1);
      setError(null);
    }
  }, [instrument]);

  if (!instrument) return null;

  const handleClose = () => {
    if (submitting) return;
    setName("");
    setVersion(1);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await duplicateInstrument(instrument.instrumentId, {
        name: name.trim(),
        version,
      });
      setName("");
      setVersion(1);
      onDuplicated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al duplicar el instrumento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl"
      >
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          Duplicar instrumento
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Se creará una copia completa de &quot;{instrument.name}&quot; con todas sus
          secciones, preguntas y opciones. La copia nace <strong>inactiva</strong> para
          que puedas revisarla antes de aplicarla en campo.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--text-primary)]">Nombre</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={255}
              disabled={submitting}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-[var(--text-primary)]">Versión</span>
            <input
              type="number"
              min={1}
              value={version}
              onChange={(e) => setVersion(Number(e.target.value) || 1)}
              required
              disabled={submitting}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 text-xs text-[var(--danger-fg)]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
          >
            {submitting ? "Duplicando…" : "Duplicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
