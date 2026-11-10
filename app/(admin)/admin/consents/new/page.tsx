"use client";

import ConsentDocumentForm from "@/components/admin/consents/ConsentDocumentForm";

export default function NewConsentDocumentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
        Nueva versión de consentimiento
      </h1>
      <ConsentDocumentForm document={null} />
    </div>
  );
}
