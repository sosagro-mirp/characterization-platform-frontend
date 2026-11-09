"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type {
  FarmerCoverageDetail,
  FarmerCoverageInstrument,
  FarmerCoverageUnit,
} from "@/app/(admin)/types";
import { getFarmerCoverage } from "@/services/farmers.service";
import { getFarmerConsentStatus } from "@/services/consents.service";
import ConsentModal from "@/components/consents/ConsentModal";
import {
  consentNoticeForFarmer,
  type ConsentNotice,
} from "@/lib/consents/consentAnchor";
import { CoverageView } from "@/components/farmers/CoverageView";
import {
  listApplyTargets,
  reapplyConfirmationText,
  type ApplyTarget,
} from "@/lib/pollster/applyTargets";
import { applyContextQuery } from "@/lib/pollster/surveyAnchor";

const btnBase =
  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)]";

export default function ProductorFichaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<FarmerCoverageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<ApplyTarget | null>(null);
  const [notice, setNotice] = useState<ConsentNotice>("none");
  const [consentOpen, setConsentOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Sin caché (lo garantiza el servicio): al volver de una encuesta la
    // cobertura se recalcula.
    getFarmerCoverage(id)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error al cargar el productor.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    // getFarmerConsentStatus nunca lanza: una falla de consulta cuenta como «pendiente».
    getFarmerConsentStatus(id).then((s) => {
      if (!cancelled) setNotice(consentNoticeForFarmer(s));
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const targets = useMemo(() => (data ? listApplyTargets(data) : []), [data]);

  const findTarget = useCallback(
    (instrument: FarmerCoverageInstrument, unit: FarmerCoverageUnit) =>
      targets.find(
        (t) =>
          t.instrumentId === instrument.instrumentId &&
          t.farmId === (unit.farmId ?? null) &&
          t.farmCropId === (unit.farmCropId ?? null),
      ),
    [targets],
  );

  const start = useCallback(
    (t: ApplyTarget) => {
      const query = applyContextQuery({
        farmerId: id,
        scopeLevel: t.scopeLevel,
        ...(t.farmId && { farmId: t.farmId }),
        ...(t.farmCropId && { farmCropId: t.farmCropId }),
      });
      router.push(`/instrument/${t.instrumentId}?${query}`);
    },
    [id, router],
  );

  const renderUnitAction = (
    instrument: FarmerCoverageInstrument,
    unit: FarmerCoverageUnit,
  ) => {
    const target = findTarget(instrument, unit);
    if (!target) return null;
    return target.requiresReapplyConfirm ? (
      <button
        type="button"
        onClick={() => setConfirming(target)}
        className={`${btnBase} border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]`}
      >
        Aplicar de nuevo
      </button>
    ) : (
      <button
        type="button"
        onClick={() => start(target)}
        className={`${btnBase} bg-brand text-brand-foreground hover:bg-brand-hover`}
      >
        Aplicar
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <Link
        href="/productores"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Productores
      </Link>

      {loading && <p className="text-sm text-[var(--text-muted)]">Cargando…</p>}
      {error && (
        <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}

      {data && (
        <>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              {data.name}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {data.farms.length === 0
                ? "Sin fincas registradas"
                : data.farms
                    .map(
                      (f) =>
                        `${f.name}${f.town ? ` · ${f.town.name}` : ""}${
                          f.crops.length
                            ? ` (${f.crops.map((c) => c.name).join(", ")})`
                            : ""
                        }`,
                    )
                    .join(" — ")}
            </p>
          </div>
          {notice !== "none" && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[var(--warning-bg)] px-4 py-3 text-xs text-[var(--warning-fg)]"
            >
              <p>
                {notice === "outdated"
                  ? "El consentimiento informado de este productor es de una versión anterior."
                  : "Este productor no tiene un consentimiento informado vigente."}{" "}
                Puedes aplicar encuestas, pero conviene registrarlo.
              </p>
              <button
                type="button"
                onClick={() => setConsentOpen(true)}
                className={`${btnBase} bg-brand text-brand-foreground hover:bg-brand-hover`}
              >
                Registrar consentimiento
              </button>
            </div>
          )}
          <CoverageView
            data={data}
            renderUnitAction={renderUnitAction}
            hint="La cobertura se recalcula cada vez que abres esta ficha."
          />
        </>
      )}

      {consentOpen && data && (
        <ConsentModal
          farmerId={id}
          defaultRespondentName={data.name}
          onAccepted={() => {
            setConsentOpen(false);
            setNotice("none");
          }}
          onClose={() => setConsentOpen(false)}
        />
      )}

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar nueva aplicación"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-lg bg-[var(--surface-elevated)] p-5 shadow-lg">
            <p className="text-sm text-[var(--text-primary)]">
              {reapplyConfirmationText(confirming)}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className={`${btnBase} text-[var(--text-muted)] hover:bg-[var(--surface-muted)]`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => start(confirming)}
                className={`${btnBase} bg-brand text-brand-foreground hover:bg-brand-hover`}
              >
                Aplicar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
