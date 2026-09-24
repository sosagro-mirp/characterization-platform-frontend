"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getProcessPreview } from "@/services/surveys.service";
import { listTowns, type TownSummary } from "@/services/towns.service";
import {
  describePreview,
  type FarmMode,
  type ProcessPreview,
} from "@/lib/public-submissions/processPreview";

export interface ProcessDecision {
  townId?: string;
  farmMode: FarmMode;
  farmId?: string;
  /** Verdadero cuando el panel cargó y las decisiones obligatorias están completas. */
  ready: boolean;
}

interface ProcessPreviewPanelProps {
  surveyId: string;
  onDecisionChange: (decision: ProcessDecision) => void;
}

const FIELD_LABEL: Record<string, string> = {
  "farmer.name": "Productor: nombre",
  "farmer.phone": "Productor: teléfono",
  "farm.name": "Finca: nombre",
  "farm.vereda": "Finca: vereda",
  "farm.area": "Finca: área",
  "farm.corregimiento": "Finca: corregimiento",
  "farm.townId": "Finca: municipio",
};

function fieldLabel(key: string): string {
  return FIELD_LABEL[key] ?? key.replace(".", ": ");
}

/**
 * Spec 93, Fase 4 — vista previa de lo que hará "Procesar" antes de ejecutarlo:
 * identidad extraída, estado del documento, finca, cultivos y advertencias.
 */
export function ProcessPreviewPanel({
  surveyId,
  onDecisionChange,
}: ProcessPreviewPanelProps) {
  const [preview, setPreview] = useState<ProcessPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [towns, setTowns] = useState<TownSummary[]>([]);
  const [townId, setTownId] = useState("");
  const [farmMode, setFarmMode] = useState<FarmMode>("create");
  const [farmId, setFarmId] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProcessPreview(surveyId, { townId: townId || undefined })
      .then((p) => {
        if (!cancelled) {
          setPreview(p);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la vista previa.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [surveyId, townId]);

  const description = useMemo(
    () => (preview ? describePreview(preview) : null),
    [preview],
  );

  // Municipios: solo se cargan cuando el envío no lo trae.
  const needsTownList = description?.requiresTown || Boolean(townId);
  useEffect(() => {
    if (!needsTownList || towns.length > 0) return;
    listTowns()
      .then(setTowns)
      .catch(() => setTowns([]));
  }, [needsTownList, towns.length]);

  const linkableCandidates = description?.farmCandidates.filter(
    (c) => c.source === "farm" && c.farmId,
  );

  const ready =
    !loading &&
    !error &&
    description !== null &&
    (description.canProcess || Boolean(townId)) &&
    (farmMode === "create" || Boolean(farmId));

  useEffect(() => {
    onDecisionChange({
      townId: townId || undefined,
      farmMode,
      farmId: farmMode === "link" ? farmId || undefined : undefined,
      ready,
    });
  }, [townId, farmMode, farmId, ready, onDecisionChange]);

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-md border border-[var(--danger-fg)]/40 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]"
      >
        {error}
      </p>
    );
  }

  if (!description || !preview) {
    return (
      <p className="text-xs text-[var(--text-muted)]" role="status">
        Cargando vista previa…
      </p>
    );
  }

  const documentLabel =
    preview.document.status === "new"
      ? "Documento nuevo: se creará un productor."
      : preview.document.status === "same_person_match"
        ? "Documento ya registrado a nombre de la misma persona: se vinculará al productor existente."
        : "Documento registrado a nombre de otra persona: tendrás que decidir si es la misma.";

  return (
    <section
      aria-label="Vista previa del procesamiento"
      aria-busy={loading}
      className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3 space-y-3"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Qué pasará al procesar
      </p>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-[var(--text-muted)]">Nombre</dt>
          <dd className="font-medium text-[var(--text-primary)]">
            {preview.identity.name ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Documento</dt>
          <dd className="font-medium text-[var(--text-primary)]">
            {preview.identity.documentId ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Teléfono</dt>
          <dd className="font-medium text-[var(--text-primary)]">
            {preview.identity.phone ?? "—"}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-[var(--text-primary)]">
        {documentLabel}{" "}
        {description.farmerHref && (
          <Link
            href={description.farmerHref}
            className="text-brand hover:underline"
          >
            Ver ficha
          </Link>
        )}
      </p>

      {description.requiresTown && (
        <div className="space-y-1">
          <label
            htmlFor="preview-town"
            className="block text-xs font-medium text-[var(--text-primary)]"
          >
            Municipio de la finca (obligatorio)
          </label>
          <select
            id="preview-town"
            value={townId}
            onChange={(e) => {
              setLoading(true);
              setTownId(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          >
            <option value="">Selecciona un municipio…</option>
            {towns.map((t) => (
              <option key={t.townId} value={t.townId}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-medium text-[var(--text-primary)]">
          Finca
        </legend>
        <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
          <input
            type="radio"
            name="farm-mode"
            checked={farmMode === "create"}
            onChange={() => setFarmMode("create")}
          />
          Crear una finca nueva
        </label>
        {description.farmCandidates.length > 0 && (
          <>
            <p className="text-xs text-[var(--warning-fg)]">
              Hay fincas con el mismo nombre y vereda. Por defecto se crea una
              nueva; vincula solo si es realmente la misma finca.
            </p>
            <label className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
              <input
                type="radio"
                name="farm-mode"
                checked={farmMode === "link"}
                disabled={!linkableCandidates?.length}
                onChange={() => setFarmMode("link")}
              />
              Vincular a una finca existente
            </label>
            <ul className="space-y-1 pl-6 text-xs">
              {description.farmCandidates.map((c, i) => (
                <li key={`${c.farmId ?? c.surveyId}-${i}`}>
                  {c.source === "farm" && c.farmId ? (
                    <label className="flex items-center gap-2 text-[var(--text-primary)]">
                      <input
                        type="radio"
                        name="farm-candidate"
                        disabled={farmMode !== "link"}
                        checked={farmId === c.farmId}
                        onChange={() => setFarmId(c.farmId as string)}
                      />
                      {c.name}
                      {c.vereda ? ` — ${c.vereda}` : ""}
                    </label>
                  ) : (
                    <span className="text-[var(--text-muted)]">
                      {c.name}
                      {c.vereda ? ` — ${c.vereda}` : ""} (otro envío pendiente)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </fieldset>

      <div className="text-xs">
        <p className="font-medium text-[var(--text-primary)]">Cultivos</p>
        {description.crops.length > 0 ? (
          <p className="text-[var(--text-primary)]">
            {description.crops.join(", ")}
          </p>
        ) : (
          <p className="text-[var(--text-muted)]">Ninguno reconocido.</p>
        )}
        {description.unmappedCrops.length > 0 && (
          <p className="text-[var(--warning-fg)]">
            Sin equivalencia en el catálogo (no se registrarán):{" "}
            {description.unmappedCrops.join(", ")}.
          </p>
        )}
      </div>

      {description.fieldsToComplete.length > 0 && (
        <div className="text-xs">
          <p className="font-medium text-[var(--text-primary)]">
            Datos que se completarán en el productor existente
          </p>
          <ul className="list-disc pl-5 text-[var(--text-primary)]">
            {description.fieldsToComplete.map((f) => (
              <li key={f}>{fieldLabel(f)}</li>
            ))}
          </ul>
        </div>
      )}

      {description.warnings.length > 0 && (
        <ul
          aria-label="Advertencias"
          className="space-y-1 rounded-md border border-[var(--warning-fg)]/30 bg-[var(--warning-bg)] px-3 py-2 text-xs text-[var(--warning-fg)]"
        >
          {description.warnings.map((w) => (
            <li key={w.code}>{w.message}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
