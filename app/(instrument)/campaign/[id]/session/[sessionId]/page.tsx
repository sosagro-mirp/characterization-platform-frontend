"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { NextStepResponse } from "@/app/(instrument)/types";
import { getNextStep } from "@/services/campaign-sessions.service";
import { getInstrumentByCode } from "@/services/instruments.service";
import {
  checkDuplicate,
  extractFarmer,
  extractCrops,
  overwriteSurvey,
  skipStep,
} from "@/services/surveys.service";
import { useCampaignSessionStore } from "@/store/useCampaignSessionStore";
import CampaignProgress from "@/components/campaign/CampaignProgress";
import DuplicateDialog from "@/components/campaign/DuplicateDialog";

interface DuplicatePending {
  instrument: { instrumentId: string; name: string; isActive: boolean };
  stepOrder: number;
  duplicateSurveyId: string;
}

export default function CampaignSessionPage() {
  const params = useParams<{ id: string; sessionId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = params.id;
  const sessionId = params.sessionId;

  const {
    farmerId,
    preSurveyPhase,
    setPreSurveyPhase,
    setFarmer,
    setProgress,
  } = useCampaignSessionStore();

  const [next, setNext] = useState<NextStepResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duplicatePending, setDuplicatePending] = useState<DuplicatePending | null>(null);
  const [duplicateActionLoading, setDuplicateActionLoading] = useState(false);
  // Incrementing this triggers the main useEffect to re-run after a skip
  const [forceRetry, setForceRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Don't run the flow while the duplicate dialog is open
    if (duplicatePending !== null) return;

    async function run() {
      try {
        // ── Phase: idle — check if farmer is needed ──────────────────────────
        if (preSurveyPhase === "idle") {
          if (farmerId) {
            setPreSurveyPhase("done");
            return;
          }
          const s1 = await getInstrumentByCode("S1");
          if (cancelled) return;
          setPreSurveyPhase("s1_pending");
          router.replace(
            `/instrument/${s1.instrumentId}?campaignSessionId=${sessionId}`,
          );
          return;
        }

        // ── Phase: s1_pending — S1 submitted, extract farmer then launch S2 ─
        if (preSurveyPhase === "s1_pending") {
          const completedSurveyId = searchParams.get("completedSurveyId");
          if (!completedSurveyId) {
            const s1 = await getInstrumentByCode("S1");
            if (cancelled) return;
            router.replace(
              `/instrument/${s1.instrumentId}?campaignSessionId=${sessionId}`,
            );
            return;
          }
          const result = await extractFarmer(completedSurveyId);
          if (cancelled) return;
          setFarmer(result.farmer.id, result.farmer.name);

          const s2 = await getInstrumentByCode("S2");
          if (cancelled) return;
          setPreSurveyPhase("s2_pending");
          router.replace(
            `/instrument/${s2.instrumentId}?campaignSessionId=${sessionId}`,
          );
          return;
        }

        // ── Phase: s2_pending — S2 submitted, extract crops then proceed ─────
        if (preSurveyPhase === "s2_pending") {
          const completedSurveyId = searchParams.get("completedSurveyId");
          if (!completedSurveyId) {
            const s2 = await getInstrumentByCode("S2");
            if (cancelled) return;
            router.replace(
              `/instrument/${s2.instrumentId}?campaignSessionId=${sessionId}`,
            );
            return;
          }
          await extractCrops(completedSurveyId);
          if (cancelled) return;
          setPreSurveyPhase("done");
        }

        // ── Phase: done — normal getNextStep flow ────────────────────────────
        const result = await getNextStep(sessionId);
        if (cancelled) return;
        setNext(result);

        if (result.instrument && typeof result.order === "number") {
          setProgress({
            currentStepOrder: result.order,
            totalSteps: result.totalSteps ?? 0,
            completedCount: result.completedCount ?? 0,
          });

          // Check for duplicate responses before navigating
          if (farmerId) {
            const dupCheck = await checkDuplicate(
              farmerId,
              result.instrument.instrumentId,
              campaignId,
            );
            if (cancelled) return;

            if (dupCheck.hasDuplicate && dupCheck.surveyId) {
              setDuplicatePending({
                instrument: result.instrument,
                stepOrder: result.order,
                duplicateSurveyId: dupCheck.surveyId,
              });
              return;
            }
          }

          router.replace(
            `/instrument/${result.instrument.instrumentId}?campaignSessionId=${sessionId}&stepOrder=${result.order}`,
          );
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Error al calcular el siguiente paso.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, preSurveyPhase, searchParams, forceRetry, duplicatePending]);

  async function handleOverwrite() {
    if (!duplicatePending) return;
    setDuplicateActionLoading(true);
    try {
      const { surveyId: newSurveyId } = await overwriteSurvey({
        surveyId: duplicatePending.duplicateSurveyId,
        sessionId,
        instrumentId: duplicatePending.instrument.instrumentId,
        stepOrder: duplicatePending.stepOrder,
      });
      setDuplicatePending(null);
      router.replace(
        `/instrument/${duplicatePending.instrument.instrumentId}` +
        `?campaignSessionId=${sessionId}` +
        `&stepOrder=${duplicatePending.stepOrder}` +
        `&existingSurveyId=${newSurveyId}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sobrescribir respuestas.");
      setDuplicatePending(null);
    } finally {
      setDuplicateActionLoading(false);
    }
  }

  async function handleSkip() {
    if (!duplicatePending) return;
    setDuplicateActionLoading(true);
    try {
      await skipStep({
        sessionId,
        instrumentId: duplicatePending.instrument.instrumentId,
        stepOrder: duplicatePending.stepOrder,
      });
      setDuplicatePending(null);
      setForceRetry((c) => c + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al pasar al siguiente paso.");
      setDuplicatePending(null);
    } finally {
      setDuplicateActionLoading(false);
    }
  }

  const finished = !loading && (!next || !next.instrument);

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8 text-center">
      {loading && (
        <p className="text-sm text-neutral-500">Buscando próximo paso…</p>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {finished && !error && (
        <section className="space-y-6">
          <div className="mx-auto w-fit rounded-full bg-green-700 p-6 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Campaña completada</h1>
          <p className="text-sm text-neutral-600">
            Has terminado todas las encuestas del flujo. Gracias.
          </p>
          <CampaignProgress
            completedCount={next?.completedCount ?? 0}
            totalSteps={next?.totalSteps ?? 0}
          />
          <button
            type="button"
            onClick={() => router.replace("/campaign")}
            className="rounded-xl bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
          >
            Volver al listado
          </button>
        </section>
      )}

      {duplicatePending && (
        <DuplicateDialog
          instrumentName={duplicatePending.instrument.name}
          onOverwrite={handleOverwrite}
          onSkip={handleSkip}
          onCancel={() => setDuplicatePending(null)}
          loading={duplicateActionLoading}
        />
      )}

      <input type="hidden" value={campaignId} readOnly />
    </main>
  );
}
