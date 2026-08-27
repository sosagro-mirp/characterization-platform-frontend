"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createConsentDocument,
  publishConsentDocument,
  updateConsentDocument,
  type ConsentDocument,
  type CreateConsentDocumentPayload,
} from "@/services/consents.service";

interface Props {
  /** Documento existente a editar; `null` para creación. */
  document: ConsentDocument | null;
}

const EMPTY: CreateConsentDocumentPayload = {
  version: "",
  title: "",
  body: "",
  dataProcessingClause: "",
  multimediaClause: "",
  rightsClause: "",
  responsibleEntity: "",
  contactEmail: "",
};

const FIELDS: {
  key: keyof CreateConsentDocumentPayload;
  label: string;
  multiline?: boolean;
}[] = [
  { key: "version", label: "Versión (ej. 1.0)" },
  { key: "title", label: "Título" },
  { key: "body", label: "Texto introductorio", multiline: true },
  { key: "dataProcessingClause", label: "Cláusula de tratamiento de datos", multiline: true },
  { key: "multimediaClause", label: "Cláusula de registro multimedia", multiline: true },
  { key: "rightsClause", label: "Derechos del titular", multiline: true },
  { key: "responsibleEntity", label: "Entidad responsable" },
  { key: "contactEmail", label: "Correo de contacto" },
];

export default function ConsentDocumentForm({ document }: Props) {
  const router = useRouter();
  const isEditable = !document || document.status === "draft";

  const [values, setValues] = useState<CreateConsentDocumentPayload>(
    document
      ? {
          version: document.version,
          title: document.title,
          body: document.body,
          dataProcessingClause: document.dataProcessingClause,
          multimediaClause: document.multimediaClause,
          rightsClause: document.rightsClause,
          responsibleEntity: document.responsibleEntity,
          contactEmail: document.contactEmail,
        }
      : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const isComplete = Object.values(values).every((v) => v.trim().length > 0);

  function setField(key: keyof CreateConsentDocumentPayload, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (document) {
        await updateConsentDocument(document.consentDocumentId, values);
        router.refresh();
      } else {
        const created = await createConsentDocument(values);
        router.push(`/admin/consents/${created.consentDocumentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la versión.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!document) return;
    setPublishing(true);
    setError(null);
    try {
      await publishConsentDocument(document.consentDocumentId);
      router.push("/admin/consents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar la versión.");
    } finally {
      setPublishing(false);
      setConfirmPublish(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {document && !isEditable && (
        <p className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]">
          Esta versión está {document.status === "published" ? "publicada" : "archivada"} y ya
          no se puede editar. Crea una versión nueva si necesitas cambiar el texto.
        </p>
      )}

      <div className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label
              className="block text-xs font-medium text-[var(--text-muted)] mb-1"
              htmlFor={field.key}
            >
              {field.label}
            </label>
            {field.multiline ? (
              <textarea
                id={field.key}
                value={values[field.key]}
                onChange={(e) => setField(field.key, e.target.value)}
                disabled={!isEditable}
                rows={4}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-60"
              />
            ) : (
              <input
                id={field.key}
                type="text"
                value={values[field.key]}
                onChange={(e) => setField(field.key, e.target.value)}
                disabled={!isEditable}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-60"
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-[var(--danger-fg)] rounded-md bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      {isEditable && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isComplete || saving}
            className="rounded-md bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando…" : document ? "Guardar cambios" : "Crear versión"}
          </button>

          {document && !confirmPublish && (
            <button
              type="button"
              onClick={() => setConfirmPublish(true)}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              Publicar
            </button>
          )}
        </div>
      )}

      {confirmPublish && document && (
        <div className="rounded-md border border-[var(--danger-fg)]/40 bg-[var(--danger-bg)] px-4 py-3 space-y-3">
          <p className="text-xs text-[var(--danger-fg)]">
            Al publicar la versión {document.version}, todos los agricultores con un
            consentimiento de una versión anterior dejarán de estar vigentes y volverán a
            verlo en su próximo encuentro. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmPublish(false)}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="rounded-md bg-[var(--danger-fg)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
            >
              {publishing ? "Publicando…" : "Confirmar publicación"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
