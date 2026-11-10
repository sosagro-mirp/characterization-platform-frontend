"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ShieldCheck } from "lucide-react";
import {
  listConsentDocuments,
  listConsentRecords,
  type ConsentDocument,
  type ConsentRecord,
} from "@/services/consents.service";
import RevokeConsentModal from "@/components/admin/consents/RevokeConsentModal";

const STATUS_LABEL: Record<ConsentDocument["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const STATUS_CLASS: Record<ConsentDocument["status"], string> = {
  draft: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
  published: "bg-brand-subtle-bg text-brand-subtle-fg",
  archived: "bg-[var(--surface-muted)] text-[var(--text-muted)] opacity-70",
};

export default function ConsentsAdminPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<ConsentDocument[]>([]);
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ConsentRecord | null>(null);
  const [recordsQuery, setRecordsQuery] = useState("");

  function reload() {
    return Promise.all([listConsentDocuments(), listConsentRecords()]).then(
      ([docs, recs]) => {
        setDocuments(docs);
        setRecords(recs);
      },
    );
  }

  const recordsFilter = recordsQuery.trim().toLowerCase();
  const filteredRecords = recordsFilter
    ? records.filter((r) => (r.respondentName ?? "").toLowerCase().includes(recordsFilter))
    : records;

  useEffect(() => {
    reload()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar consentimientos."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Consentimiento informado
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Versiones del documento y constancias de aceptación de los encuestados.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/consents/new")}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground hover:bg-brand-hover transition-colors"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Nueva versión
        </button>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Versiones del documento
            </h2>
            <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
              {documents.length > 0 ? (
                <table className="w-full text-xs">
                  <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Versión</th>
                      <th className="px-3 py-2.5 text-left">Título</th>
                      <th className="px-3 py-2.5 text-left">Estado</th>
                      <th className="px-3 py-2.5 text-left">Publicado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {documents.map((doc) => (
                      <tr
                        key={doc.consentDocumentId}
                        onClick={() => router.push(`/admin/consents/${doc.consentDocumentId}`)}
                        className="cursor-pointer hover:bg-[var(--surface-muted)] transition-colors"
                      >
                        <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">
                          {doc.version}
                        </td>
                        <td className="px-3 py-2.5 text-[var(--text-muted)]">{doc.title}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_CLASS[doc.status]}`}
                          >
                            {STATUS_LABEL[doc.status]}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[var(--text-muted)]">
                          {doc.publishedAt
                            ? new Date(doc.publishedAt).toLocaleDateString("es-CO")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
                    <ShieldCheck className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
                  </div>
                  <p className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">
                    Sin versiones creadas
                  </p>
                  <p className="max-w-sm text-xs text-[var(--text-muted)]">
                    Crea la primera versión del consentimiento informado para poder aplicarlo en campo.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Constancias registradas
              </h2>
              <div className="relative max-w-xs">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={recordsQuery}
                  onChange={(e) => setRecordsQuery(e.target.value)}
                  placeholder="Buscar por nombre…"
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
            </div>
            <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
              {filteredRecords.length > 0 ? (
                <table className="w-full text-xs">
                  <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Encuestado</th>
                      <th className="px-3 py-2.5 text-left">Versión</th>
                      <th className="px-3 py-2.5 text-left">Multimedia</th>
                      <th className="px-3 py-2.5 text-left">Fecha</th>
                      <th className="px-3 py-2.5 text-left">Estado</th>
                      <th className="px-3 py-2.5 text-left" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredRecords.map((record) => (
                      <tr key={record.consentRecordId}>
                        <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">
                          {record.respondentName ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-[var(--text-muted)]">
                          {record.consentDocument.version}
                        </td>
                        <td className="px-3 py-2.5 text-[var(--text-muted)]">
                          {[
                            record.acceptedPhoto && "Foto",
                            record.acceptedAudio && "Audio",
                            record.acceptedVideo && "Video",
                          ]
                            .filter(Boolean)
                            .join(", ") || "Ninguna"}
                        </td>
                        <td className="px-3 py-2.5 text-[var(--text-muted)]">
                          {new Date(record.acceptedAt).toLocaleDateString("es-CO")}
                        </td>
                        <td className="px-3 py-2.5">
                          {record.revokedAt ? (
                            <span className="inline-flex rounded-full bg-[var(--danger-bg)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--danger-fg)]">
                              Revocado
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-brand-subtle-bg px-2 py-0.5 text-[10.5px] font-semibold text-brand-subtle-fg">
                              Vigente
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {!record.revokedAt && (
                            <button
                              type="button"
                              onClick={() => setRevokeTarget(record)}
                              className="text-[10.5px] font-semibold text-[var(--danger-fg)] hover:underline"
                            >
                              Revocar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-6 py-12 text-center text-xs text-[var(--text-muted)]">
                  {recordsQuery
                    ? `Sin resultados para “${recordsQuery}”.`
                    : "Sin constancias registradas todavía."}
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {revokeTarget && (
        <RevokeConsentModal
          consentRecordId={revokeTarget.consentRecordId}
          respondentName={revokeTarget.respondentName}
          onClose={() => setRevokeTarget(null)}
          onRevoked={() => {
            setRevokeTarget(null);
            reload().catch(() => {});
          }}
        />
      )}
    </div>
  );
}
