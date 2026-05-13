"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NextStepResponse } from "@/app/(instrument)/types";
import { getNextStep } from "@/services/campaign-sessions.service";
import { useCampaignSessionStore } from "@/store/useCampaignSessionStore";
import CampaignProgress from "@/components/campaign/CampaignProgress";

export default function CampaignSessionPage() {
  const params = useParams<{ id: string; sessionId: string }>();
  const router = useRouter();
  const campaignId = params.id;
  const sessionId = params.sessionId;

  const setProgress = useCampaignSessionStore((s) => s.setProgress);
  const clearSession = useCampaignSessionStore((s) => s.clearSession);

  const [next, setNext] = useState<NextStepResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await getNextStep(sessionId);
        setNext(result);
        if (result.instrument && typeof result.order === "number") {
          setProgress({
            currentStepOrder: result.order,
            totalSteps: result.totalSteps ?? 0,
            completedCount: result.completedCount ?? 0,
          });
          // Redirigir al loader del instrumento con el contexto de la campaña.
          const url = `/instrument/${result.instrument.instrumentId}?campaignSessionId=${sessionId}&stepOrder=${result.order}`;
          router.replace(url);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al calcular el siguiente paso.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, router, setProgress]);

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
            onClick={() => {
              clearSession();
              router.replace("/campaign");
            }}
            className="rounded-xl bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
          >
            Volver al listado
          </button>
        </section>
      )}

      {/* campaignId conservado para futuras navegaciones internas (link "volver al intro") */}
      <input type="hidden" value={campaignId} readOnly />
    </main>
  );
}
