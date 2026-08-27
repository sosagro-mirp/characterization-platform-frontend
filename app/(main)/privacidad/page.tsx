"use client";

import { useEffect, useState } from "react";
import { getActiveConsentDocument, type ConsentDocument } from "@/services/consents.service";

/**
 * Spec 78 — página pública de privacidad, enlazada desde el footer de la
 * landing. Muestra el texto de la versión de consentimiento actualmente
 * publicada; no requiere autenticación (`GET /api/consent-documents/active`
 * es una ruta `@Public()`).
 */
export default function PrivacyPolicyPage() {
  const [document, setDocument] = useState<ConsentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveConsentDocument()
      .then(setDocument)
      .catch(() =>
        setError(
          "No hay una política de privacidad publicada en este momento. Vuelva a intentarlo más tarde.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Política de privacidad</h1>

      {loading && <p className="text-sm text-text-muted">Cargando…</p>}

      {!loading && error && (
        <p className="rounded-xl border border-[var(--danger-fg)]/30 bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}

      {!loading && document && (
        <>
          <p className="text-sm text-text-muted mb-8">
            Versión {document.version} — publicada el{" "}
            {document.publishedAt
              ? new Date(document.publishedAt).toLocaleDateString("es-CO")
              : "—"}
          </p>

          <div className="space-y-6 text-base leading-relaxed text-text-primary">
            <p>{document.body}</p>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Tratamiento de datos personales
              </h2>
              <p>{document.dataProcessingClause}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Registro multimedia
              </h2>
              <p>{document.multimediaClause}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Sus derechos como titular
              </h2>
              <p>{document.rightsClause}</p>
            </section>
          </div>

          <div className="mt-10 rounded-xl border border-[var(--border)] bg-surface p-4 text-sm text-text-muted">
            <p className="font-medium text-text-primary">Responsable del tratamiento</p>
            <p>{document.responsibleEntity}</p>
            <p>{document.contactEmail}</p>
          </div>
        </>
      )}
    </main>
  );
}
