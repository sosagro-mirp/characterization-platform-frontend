"use client";

import type { ReactNode } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import type {
  FarmerCoverageDetail,
  FarmerCoverageInstrument,
  FarmerCoverageUnit,
} from "@/app/(admin)/types";
import {
  groupInstrumentsByLevel,
  missingUnits,
  unitBadges,
} from "@/lib/farmers/coverageView";
import { StatusChip } from "@/components/common/StatusChip";

const UNLOCATED_REASONS: Record<string, string> = {
  productor_varias_fincas:
    "el productor tiene varias fincas y la encuesta no indica cuál",
  cultivo_ambiguo: "la finca tiene varios cultivos y la encuesta no indica cuál",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Badges({ unit }: { unit: FarmerCoverageUnit }) {
  const badges = unitBadges(unit);
  if (badges.length === 0) return null;
  return (
    <>
      {badges.map((b) => (
        <span
          key={b.kind}
          title={b.description}
          className="rounded-full bg-[var(--info-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--info-fg)]"
        >
          {b.label}
        </span>
      ))}
    </>
  );
}

function SurveyLink({
  surveyId,
  onOpenSurvey,
  children,
}: {
  surveyId: string | null | undefined;
  onOpenSurvey?: (surveyId: string) => void;
  children: React.ReactNode;
}) {
  if (!surveyId || !onOpenSurvey) return <>{children}</>;
  return (
    <button
      type="button"
      onClick={() => onOpenSurvey(surveyId)}
      title="Ver esta encuesta en «Encuestas»"
      className="inline-flex items-center gap-1 rounded-md hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
    >
      {children}
      <ExternalLink className="size-3 text-[var(--text-muted)]" aria-hidden="true" />
    </button>
  );
}

export type RenderUnitAction = (
  instrument: FarmerCoverageInstrument,
  unit: FarmerCoverageUnit,
) => ReactNode;

function InstrumentCard({
  instrument,
  onOpenSurvey,
  renderUnitAction,
}: {
  instrument: FarmerCoverageInstrument;
  onOpenSurvey?: (surveyId: string) => void;
  renderUnitAction?: RenderUnitAction;
}) {
  const missing = missingUnits(instrument);
  const showUnits =
    instrument.scopeLevel !== "farmer" && instrument.units.length > 0;
  const latestId = instrument.latestSurvey?.surveyId ?? null;

  return (
    <li className="px-4 py-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-[var(--text-primary)]">
          {instrument.name}
        </span>
        <StatusChip cell={{ status: instrument.status }} />
        {instrument.surveyCount > 0 && instrument.latestSurvey && (
          <span className="text-[10.5px] text-[var(--text-muted)]">
            <SurveyLink surveyId={latestId} onOpenSurvey={onOpenSurvey}>
              {instrument.surveyCount} encuesta
              {instrument.surveyCount === 1 ? "" : "s"} · última el{" "}
              {formatDate(instrument.latestSurvey.createdAt)}
            </SurveyLink>
          </span>
        )}
        {/* Spec 102 — nivel productor: una sola unidad, la acción va en el encabezado. */}
        {!showUnits &&
          instrument.units.map((unit) => (
            <span key={unit.label} className="ml-auto">
              {renderUnitAction?.(instrument, unit)}
            </span>
          ))}
      </div>

      {instrument.status === "parcial" && missing.length > 0 && (
        <p className="mt-1.5 text-[var(--warning-fg)]">
          Falta en: {missing.map((u) => u.label).join(", ")}
        </p>
      )}

      {showUnits && (
        <ul className="mt-2 space-y-1.5 border-l border-[var(--border)] pl-3">
          {instrument.units.map((unit) => (
            <li
              key={`${unit.farmId ?? ""}-${unit.farmCropId ?? ""}-${unit.label}`}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-[var(--text-primary)]">
                <SurveyLink surveyId={unit.surveyId} onOpenSurvey={onOpenSurvey}>
                  {unit.label}
                </SurveyLink>
              </span>
              <StatusChip cell={{ status: unit.status }} />
              <Badges unit={unit} />
              {renderUnitAction && (
                <span className="ml-auto">{renderUnitAction(instrument, unit)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function CoverageView({
  data,
  onOpenSurvey,
  renderUnitAction,
  hint = "La cobertura se calcula al abrir esta pestaña con las fincas, los cultivos y las encuestas actuales: si cambian, el resultado cambia.",
}: {
  data: FarmerCoverageDetail;
  onOpenSurvey?: (surveyId: string) => void;
  renderUnitAction?: RenderUnitAction;
  hint?: string;
}) {
  const groups = groupInstrumentsByLevel(data.instruments);
  const { summary } = data;

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {summary.applied} de {summary.applicable} instrumentos aplicados
        </p>
        <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">
          {summary.partial} parcial{summary.partial === 1 ? "" : "es"} ·{" "}
          {summary.pending} en falta · {summary.notApplicable} no aplican
          {summary.instrumentsWithoutScope > 0 &&
            ` · ${summary.instrumentsWithoutScope} sin alcance definido`}
        </p>
        <p className="mt-1.5 text-[10.5px] text-[var(--text-muted)]">
          {hint}
        </p>
      </section>

      {(data.warnings.includes("sin_finca") ||
        data.warnings.includes("sin_cultivo") ||
        data.unlocatedSurveys.length > 0 ||
        data.unsyncedWithResponses > 0) && (
        <section
          className="space-y-1 rounded-md bg-[var(--warning-bg)] px-4 py-3 text-xs text-[var(--warning-fg)]"
          role="status"
        >
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            Avisos
          </p>
          {data.warnings.includes("sin_finca") && (
            <p>Este productor no tiene fincas: los instrumentos de finca y cultivo no se pueden evaluar.</p>
          )}
          {data.warnings.includes("sin_cultivo") && (
            <p>Hay fincas sin cultivos registrados: los instrumentos de cultivo no se pueden evaluar en ellas.</p>
          )}
          {data.unlocatedSurveys.length > 0 && (
            <div>
              <p>
                {data.unlocatedSurveys.length} encuesta
                {data.unlocatedSurveys.length === 1 ? "" : "s"} sin ubicar en una
                finca o cultivo:
              </p>
              <ul className="ml-4 list-disc">
                {data.unlocatedSurveys.map((u) => (
                  <li key={u.surveyId}>
                    <SurveyLink surveyId={u.surveyId} onOpenSurvey={onOpenSurvey}>
                      Ver encuesta
                    </SurveyLink>{" "}
                    — {UNLOCATED_REASONS[u.reason] ?? u.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.unsyncedWithResponses > 0 && (
            <p>
              {data.unsyncedWithResponses} encuesta
              {data.unsyncedWithResponses === 1 ? "" : "s"} con respuestas aún sin sincronizar.
            </p>
          )}
        </section>
      )}

      {groups.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">
          No hay instrumentos de caracterización con alcance definido.
        </p>
      )}

      {groups.map((group) => (
        <section
          key={group.level}
          className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]"
        >
          <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
            <h2 className="text-xs font-semibold text-[var(--text-primary)]">
              {group.title} ({group.instruments.length})
            </h2>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {group.instruments.map((instrument) => (
              <InstrumentCard
                key={instrument.instrumentId}
                instrument={instrument}
                onOpenSurvey={onOpenSurvey}
                renderUnitAction={renderUnitAction}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
