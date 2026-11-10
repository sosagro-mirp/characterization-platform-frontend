"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import {
  getFarmerDiscrepancies,
  resolveDiscrepancy,
} from "@/services/farmers.service";
import {
  humanizeDiscrepancyField,
  type Discrepancy,
} from "@/lib/farmers/farmerFarms";
import {
  allowedDiscrepancyActions,
  applyConfirmationText,
  discrepancyValueLabels,
  type DiscrepancyAction,
} from "@/lib/farmers/discrepancyActions";

const ENTITY_LABELS: Record<Discrepancy["entityType"], string> = {
  farmer: "Productor",
  farm: "Finca",
  farmer_farm: "Vínculo productor-finca",
};

interface Props {
  farmerId: string;
  /** «Datos» tiene cambios sin guardar: se bloquea la resolución (C15). */
  blocked: boolean;
  /** Se llama tras aplicar, para recargar productor y finca. */
  onApplied: () => void | Promise<void>;
}

export function DiscrepanciesPanel({ farmerId, blocked, onApplied }: Props) {
  const [items, setItems] = useState<Discrepancy[] | null>(null);
  const [pending, setPending] = useState<{
    discrepancy: Discrepancy;
    action: DiscrepancyAction;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await getFarmerDiscrepancies(farmerId, "open");
      setItems(d.filter((x) => x.status === "open"));
    } catch {
      setItems(null); // sin acceso o sin servicio: la sección no se muestra
    }
  }, [farmerId]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirm() {
    if (!pending) return;
    const { discrepancy, action } = pending;
    setBusy(true);
    setError(null);
    setNotice(null);
    let resolved = false;
    try {
      await resolveDiscrepancy(discrepancy.discrepancyId, action);
      resolved = true;
      setPending(null);
      await load();
      if (action === "apply") await onApplied();
    } catch (err) {
      if (resolved) {
        // La diferencia sí quedó resuelta; solo falló la recarga posterior.
        setNotice(
          "La diferencia se resolvió, pero no se pudo recargar la ficha. Recarga la página para ver los datos actualizados.",
        );
        return;
      }
      setPending(null);
      if (err instanceof ApiError && err.status === 409) {
        setNotice("Esta diferencia ya fue resuelta. Se actualizó la lista.");
        await load();
      } else {
        setError(
          err instanceof Error ? err.message : "No se pudo resolver la diferencia.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  if (!items || (items.length === 0 && !notice)) return null;

  return (
    <section className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
        <h2 className="text-xs font-semibold text-[var(--text-primary)]">
          Diferencias por revisar ({items.length})
        </h2>
        <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">
          Valores enviados en una encuesta que difieren de los ya guardados. Aplícalos o descártalos.
        </p>
      </div>

      {blocked && (
        <p className="bg-[var(--warning-bg)] px-4 py-2 text-xs text-[var(--warning-fg)]" role="status">
          Hay cambios sin guardar en «Datos». Guárdalos o cancélalos antes de resolver diferencias.
        </p>
      )}
      {notice && (
        <p className="bg-[var(--info-bg)] px-4 py-2 text-xs text-[var(--info-fg)]" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="bg-[var(--danger-bg)] px-4 py-2 text-xs text-[var(--danger-fg)]" role="alert">
          {error}
        </p>
      )}

      <ul className="divide-y divide-[var(--border)]">
        {items.map((d) => {
          const labels = discrepancyValueLabels(d);
          const actions = allowedDiscrepancyActions(d);
          return (
            <li key={d.discrepancyId} className="px-4 py-3 text-xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {ENTITY_LABELS[d.entityType]}: {humanizeDiscrepancyField(d.field)}
                    {d.isStale && (
                      <span className="ml-2 rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--warning-fg)]">
                        Desactualizada
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[var(--text-muted)]">
                    Guardado: <span className="text-[var(--text-primary)]">{labels.currentText}</span>
                    {" · "}
                    Enviado: <span className="text-[var(--text-primary)]">{labels.submittedText}</span>
                    {d.isStale && (
                      <>
                        {" · "}
                        Ahora: <span className="text-[var(--text-primary)]">{labels.liveText}</span>
                      </>
                    )}
                  </p>
                  {d.entityType === "farmer_farm" && (
                    <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">
                      Este tipo de diferencia solo se puede descartar.
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {actions.includes("apply") && (
                    <button
                      type="button"
                      disabled={blocked || busy}
                      onClick={() => setPending({ discrepancy: d, action: "apply" })}
                      className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] disabled:opacity-50"
                    >
                      Aplicar
                    </button>
                  )}
                  {actions.includes("dismiss") && (
                    <button
                      type="button"
                      disabled={blocked || busy}
                      onClick={() => setPending({ discrepancy: d, action: "dismiss" })}
                      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] disabled:opacity-50"
                    >
                      Descartar
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={pending.action === "apply" ? "Confirmar cambio" : "Confirmar descarte"}
        >
          <div className="w-full max-w-md space-y-4 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
            <p className="text-sm text-[var(--text-primary)]">
              {pending.action === "apply"
                ? applyConfirmationText(pending.discrepancy, {
                    farmFarmerCount: pending.discrepancy.farmFarmerCount,
                  })
                : `¿Descartar la diferencia en ${humanizeDiscrepancyField(pending.discrepancy.field).toLowerCase()}? El dato guardado no cambia.`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setPending(null)}
                className="rounded-md border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirm}
                className="rounded-md bg-[var(--brand)] px-4 py-2 text-xs font-medium text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] disabled:opacity-50"
              >
                {busy ? "Procesando…" : pending.action === "apply" ? "Aplicar" : "Descartar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
