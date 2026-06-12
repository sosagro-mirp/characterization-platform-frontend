"use client";

interface DuplicateDialogProps {
  instrumentName: string;
  onOverwrite: () => void;
  onSkip: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function DuplicateDialog({
  instrumentName,
  onOverwrite,
  onSkip,
  onCancel,
  loading = false,
}: DuplicateDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-full bg-amber-100 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5 text-amber-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <div>
            <h3
              id="duplicate-dialog-title"
              className="text-base font-semibold text-gray-900"
            >
              Respuestas existentes
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Este encuestado ya tiene respuestas asociadas a{" "}
              <span className="font-medium">{instrumentName}</span>.
              ¿Desea sobrescribirlas o pasar a la siguiente encuesta?
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onOverwrite}
            disabled={loading}
            className="w-full rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Procesando…" : "Sobrescribir respuestas"}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Pasar a la siguiente encuesta
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full px-4 py-2 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
