"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { NextStepResponse } from "@/app/(instrument)/types";
import { getNextStep } from "@/services/campaign-sessions.service";
import { getInstrumentByCode } from "@/services/instruments.service";
import { extractFarmer, extractCrops } from "@/services/surveys.service";
import { useCampaignSessionStore } from "@/store/useCampaignSessionStore";
import CampaignProgress from "@/components/campaign/CampaignProgress";

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

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // ── Phase: idle — check if farmer is needed ──────────────────────────
        if (preSurveyPhase === "idle") {
          if (farmerId) {
            // Farmer already assigned (via search or continue-last): skip pre-survey
            setPreSurveyPhase("done");
            return;
          }
          // No farmer → send user to fill S1; survey created on submit by InstrumentQuestionFlow
          const s1 = await getInstrumentByCode("S1");
          if (cancelled) return;
          setPreSurveyPhase("s1_pending");
          router.replace(
            `/instrument/${s1.instrumentId}?campaignSessionId=${sessionId}`,
          );
          return;
        }

        // ── Phase: s1_pending — S1 submitted, extract farmer then launch S2 ─
        // completedSurveyId is the real surveyId created during S1 submission,
        // passed back via URL query param from SurveyCompletedCard.
        if (preSurveyPhase === "s1_pending") {
          const completedSurveyId = searchParams.get("completedSurveyId");
          if (!completedSurveyId) {
            // No completedSurveyId — user navigated here without finishing S1
            // (e.g., after a transient error). Re-launch S1 for recovery.
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
            // No completedSurveyId — re-launch S2 for recovery.
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
  }, [sessionId, preSurveyPhase, searchParams]);

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

      <input type="hidden" value={campaignId} readOnly />
    </main>
  );
}
