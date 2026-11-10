"use client";

import { useEffect, useState } from "react";
import { InstrumentListItem, QuestionDetail, SectionSummary } from "@/app/(admin)/types";
import { getInstruments } from "@/services/instruments.service";
import { getSections } from "@/services/sections.service";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";

interface CopyQuestionDialogProps {
  question: QuestionDetail | null;
  onClose: () => void;
}

export default function CopyQuestionDialog({ question, onClose }: CopyQuestionDialogProps) {
  const { instrumentId: currentInstrumentId, sections: currentSections, copyQuestionToInstrument } =
    useInstrumentEditorStore();

  const [instruments, setInstruments] = useState<InstrumentListItem[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(false);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
  const [targetSections, setTargetSections] = useState<SectionSummary[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ instrumentName: string; sectionName: string } | null>(
    null,
  );

  useEffect(() => {
    if (!question) return;
    setSelectedInstrumentId("");
    setTargetSections([]);
    setSelectedSectionId("");
    setError(null);
    setResult(null);
    setLoadingInstruments(true);
    getInstruments({ excludeSystem: true })
      .then(setInstruments)
      .catch(() => setError("No se pudo cargar la lista de instrumentos"))
      .finally(() => setLoadingInstruments(false));
  }, [question]);

  useEffect(() => {
    if (!selectedInstrumentId) {
      setTargetSections([]);
      setSelectedSectionId("");
      return;
    }
    // El instrumento abierto ya tiene sus secciones en memoria; evita un
    // fetch redundante y refleja cambios sin guardar todavía.
    if (selectedInstrumentId === currentInstrumentId) {
      setTargetSections(currentSections);
      setSelectedSectionId("");
      return;
    }
    setLoadingSections(true);
    getSections(selectedInstrumentId)
      .then((sections) => {
        setTargetSections(sections);
        setSelectedSectionId("");
      })
      .catch(() => setError("No se pudo cargar las secciones del instrumento elegido"))
      .finally(() => setLoadingSections(false));
  }, [selectedInstrumentId, currentInstrumentId, currentSections]);

  if (!question) return null;

  const hasCondition = question.conditionQuestionId !== null;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !selectedSectionId) return;
    setSubmitting(true);
    setError(null);
    try {
      const { droppedCondition } = await copyQuestionToInstrument(
        selectedInstrumentId,
        selectedSectionId,
        question.questionId,
      );
      const instrumentName =
        instruments.find((i) => i.instrumentId === selectedInstrumentId)?.name ?? "";
      const sectionName =
        targetSections.find((s) => s.sectionId === selectedSectionId)?.name ?? "";
      setResult({ instrumentName, sectionName });
      void droppedCondition; // ya se advirtió antes de copiar; se repite en el mensaje final
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al copiar la pregunta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
        {result ? (
          <>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Pregunta copiada
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Se copió a <strong>{result.instrumentName}</strong>, sección{" "}
              <strong>{result.sectionName}</strong>.
            </p>
            {hasCondition && (
              <p className="mt-2 text-xs text-[var(--warning-fg)]">
                La condición de visibilidad de la pregunta original no viajó a la copia.
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Copiar a otro instrumento
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Copia &quot;{question.text}&quot; con sus opciones al final de la sección que elijas.
              La pregunta original no se modifica.
            </p>

            {hasCondition && (
              <p className="mt-3 rounded-md bg-[var(--warning-bg)] px-3 py-2 text-xs text-[var(--warning-fg)]">
                Esta pregunta depende de otra para mostrarse. Esa condición de visibilidad no
                viajará a la copia.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  Instrumento destino
                </span>
                <select
                  required
                  value={selectedInstrumentId}
                  onChange={(e) => setSelectedInstrumentId(e.target.value)}
                  disabled={submitting || loadingInstruments}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
                >
                  <option value="">
                    {loadingInstruments ? "Cargando…" : "Seleccionar instrumento…"}
                  </option>
                  {instruments.map((i) => (
                    <option key={i.instrumentId} value={i.instrumentId}>
                      {i.name}
                      {i.instrumentId === currentInstrumentId ? " (este instrumento)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  Sección destino
                </span>
                <select
                  required
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={submitting || loadingSections || !selectedInstrumentId}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
                >
                  <option value="">
                    {loadingSections ? "Cargando…" : "Seleccionar sección…"}
                  </option>
                  {targetSections.map((s) => (
                    <option key={s.sectionId} value={s.sectionId}>
                      {s.name}
                    </option>
                  ))}
                </select>
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
                disabled={submitting || !selectedSectionId}
                className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
              >
                {submitting ? "Copiando…" : "Copiar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
