"use client";

import { useEffect, useId, useRef } from "react";
import { Clock } from "lucide-react";
import { ApiError } from "@/lib/apiClient";
import { PUBLIC_CACHE_MINUTES } from "@/lib/dashboard/chartCompat";

/** Estilos compartidos del constructor (DESIGN.md: botones e inputs del panel). */
export const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] aria-[invalid=true]:border-[var(--danger-fg)]";
export const labelClass = "block text-sm font-medium text-[var(--text-primary)] mb-1";
export const primaryButton =
  "inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed";
export const secondaryButton =
  "inline-flex items-center gap-2 rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-subtle-bg disabled:opacity-50 disabled:cursor-not-allowed";
export const ghostButton =
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed";
export const dangerButton =
  "inline-flex items-center gap-2 rounded-md bg-[var(--danger-fg)] px-4 py-2 text-sm font-medium text-white hover:opacity-90";

/** Mensaje legible de un error de la API (incluye el detalle de fuentes bloqueadas). */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const body = err.body as {
      blocked?: { questionId: string; reason: string }[];
    } | null;
    if (body?.blocked?.length) {
      return `${err.message} ${body.blocked.map((b) => b.reason).join(" · ")}`;
    }
    return err.message;
  }
  return err instanceof Error ? err.message : fallback;
}

/** P22: el público tarda hasta 5 minutos en reflejar un cambio. */
export function CacheNotice() {
  return (
    <p className="flex items-start gap-2 rounded-md bg-[var(--info-bg)] px-3 py-2 text-xs text-[var(--info-fg)]">
      <Clock size={16} className="mt-px shrink-0" aria-hidden="true" />
      Los cambios en gráficos públicos pueden tardar hasta {PUBLIC_CACHE_MINUTES} minutos en
      verse en el dashboard público. El dashboard privado los muestra de inmediato.
    </p>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-xs font-medium text-[var(--success-fg)]">
      Publicado
    </span>
  ) : (
    <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
      Borrador
    </span>
  );
}

export function AudienceBadge({ audience }: { audience: "public" | "private" }) {
  return (
    <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
      {audience === "public" ? "Público" : "Privado"}
    </span>
  );
}

export function HealthBadge({ health }: { health: "ok" | "needs_review" }) {
  if (health === "ok") return null;
  return (
    <span className="rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-xs font-medium text-[var(--warning-fg)]">
      Requiere revisión
    </span>
  );
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmación con `<dialog>` nativo abierto con `showModal()`: el navegador
 * da foco contenido, `Esc`, página inerte y devolución del foco al invocador.
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => {
        const value = ref.current?.returnValue;
        if (ref.current) ref.current.returnValue = "";
        if (value === "confirm") onConfirm();
        else onCancel();
      }}
      className="m-auto w-full max-w-sm rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] p-6 text-[var(--text-primary)] shadow-xl overscroll-contain backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-black/40"
    >
      <h2 id={titleId} className="text-base font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
      <form method="dialog" className="mt-6 flex justify-end gap-3">
        <button value="cancel" autoFocus className={ghostButton + " px-4 py-2"}>
          Cancelar
        </button>
        <button value="confirm" className={destructive ? dangerButton : primaryButton}>
          {confirmLabel}
        </button>
      </form>
    </dialog>
  );
}
