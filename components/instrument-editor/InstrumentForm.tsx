"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  ActorTypeSummary,
  CreateInstrumentRequest,
  UpdateInstrumentRequest,
} from "@/app/(admin)/types";
import { useAuthStore } from "@/store/useAuthStore";
import { buildPublicSurveyUrl } from "@/lib/public-surveys/publicSurveyUrl";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";

interface InstrumentFormProps {
  actorTypes: ActorTypeSummary[];
  initialValues?: {
    name: string;
    version: number;
    publishDate: string;
    isActive: boolean;
    isPublic: boolean;
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
  /** Spec 79 — necesario para armar la URL pública una vez isPublic está activo. Ausente al crear (el instrumento aún no tiene id). */
  instrumentId?: string;
  /** Spec 79, criterio 3 — nombres en español de los tipos de pregunta multimedia presentes; deshabilita el toggle "Enlace público" y explica el motivo. */
  mediaTypesPresent?: string[];
}

export default function InstrumentForm({
  actorTypes,
  initialValues,
  onSubmit,
  submitLabel = "Guardar",
  autoSave = false,
  instrumentId,
  mediaTypesPresent = [],
}: InstrumentFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [version, setVersion] = useState(initialValues?.version ?? 1);
  const [publishDate, setPublishDate] = useState(
    initialValues?.publishDate ?? new Date().toISOString().slice(0, 10),
  );
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [isPublic, setIsPublic] = useState(initialValues?.isPublic ?? false);
  const [publicToggleError, setPublicToggleError] = useState<string>();
  const [copied, setCopied] = useState(false);
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

  // Spec 79, criterio 3 — a diferencia del resto de campos, este necesita su
  // propio mensaje de error inline: el 422 del backend explica exactamente
  // qué preguntas bloquean el enlace, y el indicador global del header no es
  // suficientemente específico para esa explicación. Revierte el checkbox
  // si el backend rechaza el cambio.
  const handleIsPublicChange = async (checked: boolean) => {
    setPublicToggleError(undefined);
    setIsPublic(checked);
    if (!autoSave) return;
    try {
      await onSubmit({ isPublic: checked });
    } catch (err) {
      setIsPublic(!checked);
      setPublicToggleError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el enlace público.",
      );
    }
  };

  const publicSurveyUrl =
    instrumentId && typeof window !== "undefined"
      ? buildPublicSurveyUrl(window.location.origin, instrumentId)
      : null;

  const handleCopyUrl = async () => {
    if (!publicSurveyUrl) return;
    try {
      await navigator.clipboard.writeText(publicSurveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible — el usuario puede seleccionar el texto manualmente */
    }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs text-[var(--text-muted)]">
          Nombre
        </label>
        <input
          type="text"
          required
          maxLength={255}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-[var(--text-muted)]">
            Versión
          </label>
          <input
            type="number"
            required
            min={1}
            value={version}
            onChange={(e) => setVersion(Number(e.target.value))}
            onBlur={handleVersionBlur}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-[var(--text-muted)]">
            Fecha de publicación
          </label>
          <input
            type="date"
            required
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            onBlur={handlePublishDateBlur}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
          <label htmlFor="isActive" className="flex items-start gap-2.5 text-sm text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => handleIsActiveChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)]"
            />
            <span>
              Instrumento activo
              <span className="mt-0.5 block text-[10.5px] text-[var(--text-muted)]">
                Visible para encuestadores en campaña.
              </span>
            </span>
          </label>
        </div>
      )}

      {isAdmin && autoSave && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3.5 space-y-3">
          <label
            htmlFor="isPublic"
            className={`flex items-start gap-2.5 text-sm text-[var(--text-primary)] ${
              mediaTypesPresent.length > 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              disabled={mediaTypesPresent.length > 0}
              onChange={(e) => void handleIsPublicChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)]"
            />
            <span>
              Enlace público
              <span className="mt-0.5 block text-[10.5px] text-[var(--text-muted)]">
                Cualquier persona con el enlace puede responder sin cuenta. Las
                respuestas quedan pendientes de revisión, sin agricultor asociado.
              </span>
            </span>
          </label>

          {mediaTypesPresent.length > 0 && (
            <p className="text-[10.5px] text-[var(--warning-fg)]">
              No se puede activar: este instrumento tiene preguntas de tipo{" "}
              {mediaTypesPresent.join(", ")}, que requieren el flujo autenticado
              de subida de archivos.
            </p>
          )}

          {publicToggleError && (
            <p className="text-[10.5px] text-[var(--danger-fg)]">{publicToggleError}</p>
          )}

          {isPublic && publicSurveyUrl && (
            <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2">
              <span className="min-w-0 flex-1 truncate text-xs text-[var(--text-primary)]">
                {publicSurveyUrl}
              </span>
              <button
                type="button"
                onClick={() => void handleCopyUrl()}
                aria-label={copied ? "Enlace copiado" : "Copiar enlace público"}
                className="shrink-0 rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          )}
        </div>
      )}

      {actorTypes.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-[var(--text-muted)]">
            Tipos de actor
          </p>
          <div className="flex flex-wrap gap-1.5">
            {actorTypes.map((at) => (
              <button
                key={at.actorTypeId}
                type="button"
                onClick={() => toggleActorType(at.actorTypeId)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedActorTypeIds.includes(at.actorTypeId)
                    ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                {at.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!autoSave && (
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saveStatus === "saving"}
            className="rounded-md bg-[var(--brand)] px-5 py-2 text-sm font-medium text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
          >
            {submitLabel}
          </button>
          <SaveStatusIndicator status={saveStatus} errorMessage={errorMessage} />
        </div>
      )}
    </form>
  );
}
