"use client";

// Spec 68/84 — el documento ya está registrado a nombre de otra persona.
// Equivalente web de `DocumentCollisionModal` en mobile: el flujo web no
// tenía manejo de este 409 antes del spec 84 (solo lo cubría el canal
// público, spec 79).

interface DocumentCollisionDialogProps {
  submittedName: string;
  existingFarmerName: string;
  onSamePerson: () => void;
  onSeparatePerson: () => void;
  loading?: boolean;
}

export default function DocumentCollisionDialog({
  submittedName,
  existingFarmerName,
  onSamePerson,
  onSeparatePerson,
  loading = false,
}: DocumentCollisionDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-collision-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <h3
          id="document-collision-title"
          className="text-base font-semibold text-text-primary"
        >
          El documento ya está registrado
        </h3>
        <p className="mt-2 text-sm text-text-muted">
          El documento ingresado para <span className="font-medium">{submittedName}</span>{" "}
          ya está registrado a nombre de{" "}
          <span className="font-medium">{existingFarmerName}</span>. ¿Es la misma
          persona o son personas distintas?
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onSamePerson}
            disabled={loading}
            className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {loading ? "Procesando…" : "Es la misma persona"}
          </button>
          <button
            type="button"
            onClick={onSeparatePerson}
            disabled={loading}
            className="w-full rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-muted disabled:opacity-50 transition-colors"
          >
            Son personas distintas
          </button>
        </div>
      </div>
    </div>
  );
}
