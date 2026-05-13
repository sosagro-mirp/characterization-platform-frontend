"use client";

import { useRef, useState } from "react";
import {
  ActorTypeSummary,
  CreateInstrumentRequest,
  UpdateInstrumentRequest,
} from "@/app/(admin)/types";
import { useAuthStore } from "@/store/useAuthStore";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";

interface InstrumentFormProps {
  actorTypes: ActorTypeSummary[];
  initialValues?: {
    name: string;
    version: number;
    publishDate: string;
    isActive: boolean;
    actorTypeIds: string[];
  };
  onSubmit: (
    data: CreateInstrumentRequest | UpdateInstrumentRequest,
  ) => Promise<void>;
  submitLabel?: string;
  /**
   * Si es true, el formulario auto-guarda cada cambio (en blur o change según el
   * tipo de campo) y oculta el botón de submit. Pensado para edición de
   * instrumentos ya creados, donde la fuente de verdad vive en el store y el
   * indicador global del header refleja el estado.
   */
  autoSave?: boolean;
}

export default function InstrumentForm({
  actorTypes,
  initialValues,
  onSubmit,
  submitLabel = "Guardar",
  autoSave = false,
}: InstrumentFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [version, setVersion] = useState(initialValues?.version ?? 1);
  const [publishDate, setPublishDate] = useState(
    initialValues?.publishDate ?? new Date().toISOString().slice(0, 10),
  );
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [selectedActorTypeIds, setSelectedActorTypeIds] = useState<string[]>(
    initialValues?.actorTypeIds ?? [],
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");

  const lastPersisted = useRef({
    name: initialValues?.name ?? "",
    version: initialValues?.version ?? 1,
    publishDate:
      initialValues?.publishDate ?? new Date().toISOString().slice(0, 10),
  });

  const persist = async (patch: UpdateInstrumentRequest) => {
    try {
      await onSubmit(patch);
    } catch {
      // El indicador global del header ya muestra el error vía el store.
    }
  };

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (!autoSave || !trimmed || trimmed === lastPersisted.current.name) return;
    lastPersisted.current.name = trimmed;
    void persist({ name: trimmed });
  };

  const handleVersionBlur = () => {
    if (!autoSave) return;
    if (!Number.isFinite(version) || version < 1) return;
    if (version === lastPersisted.current.version) return;
    lastPersisted.current.version = version;
    void persist({ version });
  };

  const handlePublishDateBlur = () => {
    if (!autoSave || !publishDate) return;
    if (publishDate === lastPersisted.current.publishDate) return;
    lastPersisted.current.publishDate = publishDate;
    void persist({ publishDate });
  };

  const handleIsActiveChange = (checked: boolean) => {
    setIsActive(checked);
    if (autoSave) void persist({ isActive: checked });
  };

  const toggleActorType = (id: string) => {
    setSelectedActorTypeIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (autoSave) void persist({ actorTypeIds: next });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (autoSave) return;
    setSaveStatus("saving");
    setErrorMessage(undefined);
    try {
      await onSubmit({
        name: name.trim(),
        version,
        publishDate,
        isActive,
        actorTypeIds: selectedActorTypeIds,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al guardar");
      setSaveStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Nombre
        </label>
        <input
          type="text"
          required
          maxLength={255}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Versión
          </label>
          <input
            type="number"
            required
            min={1}
            value={version}
            onChange={(e) => setVersion(Number(e.target.value))}
            onBlur={handleVersionBlur}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Fecha de publicación
          </label>
          <input
            type="date"
            required
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            onBlur={handlePublishDateBlur}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => handleIsActiveChange(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border)] accent-green-700"
          />
          <label htmlFor="isActive" className="text-sm text-[var(--text-primary)]">
            Instrumento activo (visible para encuestadores)
          </label>
        </div>
      )}

      {actorTypes.length > 0 && (
        <div>
          <p className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Tipos de actor
          </p>
          <div className="flex flex-wrap gap-2">
            {actorTypes.map((at) => (
              <button
                key={at.actorTypeId}
                type="button"
                onClick={() => toggleActorType(at.actorTypeId)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  selectedActorTypeIds.includes(at.actorTypeId)
                    ? "bg-[var(--brand)] border-green-700 text-white"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                {at.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {autoSave ? (
        <p className="pt-2 text-xs text-[var(--text-muted)]">
          Los cambios se guardan automáticamente.
        </p>
      ) : (
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className="rounded-xl bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
          >
            {submitLabel}
          </button>
          <SaveStatusIndicator status={saveStatus} errorMessage={errorMessage} />
        </div>
      )}
    </form>
  );
}
