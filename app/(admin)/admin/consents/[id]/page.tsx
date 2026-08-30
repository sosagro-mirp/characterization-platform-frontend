"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getConsentDocument, type ConsentDocument } from "@/services/consents.service";
import ConsentDocumentForm from "@/components/admin/consents/ConsentDocumentForm";

export default function ConsentDocumentPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<ConsentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConsentDocument(params.id)
      .then(setDocument)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar la versión."),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Cargando…</p>;
  }

  if (error || !document) {
    return (
      <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
        {error ?? "Versión no encontrada."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Versión {document.version} del consentimiento
      </h1>
      <ConsentDocumentForm document={document} />
    </div>
  );
}
