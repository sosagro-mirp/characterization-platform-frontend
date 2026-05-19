"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCampaignRender } from "@/services/campaigns.service";
import type { CampaignRender, InstrumentResponse } from "@/app/(instrument)/types";
import InstrumentQuestionFlow from "@/components/instrument/InstrumentQuestionFlow";

type PreviewPhase =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "intro"; campaign: CampaignRender }
  | { phase: "instrument_loading"; campaign: CampaignRender; stepIndex: number }
  | {
      phase: "instrument";
      campaign: CampaignRender;
      stepIndex: number;
      instrument: InstrumentResponse;
    }
  | { phase: "step_transition"; campaign: CampaignRender; stepIndex: number }
  | { phase: "completed"; campaign: CampaignRender };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default function CampaignPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const [state, setState] = useState<PreviewPhase>({ phase: "loading" });
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (state.phase !== "completed") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.replace("/admin/campaigns");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.phase, router]);

  // Load campaign on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const campaign = await getCampaignRender(campaignId);
        if (!cancelled) setState({ phase: "intro", campaign });
      } catch (err) {
        if (!cancelled)
          setState({
            phase: "error",
            message:
              err instanceof Error ? err.message : "Error al cargar la campaña.",
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  // Load instrument whenever we enter instrument_loading phase
  useEffect(() => {
    if (state.phase !== "instrument_loading") return;
    let cancelled = false;
    const { campaign, stepIndex } = state;
    const step = campaign.steps[stepIndex];

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/instruments/${step.instrument.instrumentId}/render`,
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const instrument: InstrumentResponse = await res.json();
        if (!cancelled)
          setState({ phase: "instrument", campaign, stepIndex, instrument });
      } catch (err) {
        if (!cancelled)
          setState({
            phase: "error",
            message:
              err instanceof Error
                ? err.message
                : "Error al cargar el instrumento.",
          });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state]);

  const handleStartPreview = () => {
    if (state.phase !== "intro") return;
    setState({
      phase: "instrument_loading",
      campaign: state.campaign,
      stepIndex: 0,
    });
  };

  const handleStepComplete = () => {
    if (state.phase !== "instrument") return;
    const { campaign, stepIndex } = state;
    if (stepIndex + 1 < campaign.steps.length) {
      setState({ phase: "step_transition", campaign, stepIndex });
    } else {
      setState({ phase: "completed", campaign });
    }
  };

  const handleNextStep = () => {
    if (state.phase !== "step_transition") return;
    setState({
      phase: "instrument_loading",
      campaign: state.campaign,
      stepIndex: state.stepIndex + 1,
    });
  };

  if (state.phase === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">Cargando campaña…</p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 text-center">
        <p className="text-red-600 font-medium">{state.message}</p>
        <Link
          href="/admin/campaigns"
          className="text-sm text-green-700 underline"
        >
          Volver a campañas
        </Link>
      </div>
    );
  }

  if (state.phase === "intro") {
    const { campaign } = state;
    return (
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-300 px-4 py-2 text-sm text-amber-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0">
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
          </svg>
          Modo vista previa — sin datos enviados
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">{campaign.name}</h1>
          {campaign.description && (
            <p className="mt-2 text-sm text-neutral-600">{campaign.description}</p>
          )}
          <p className="mt-4 text-xs text-neutral-500">
            Esta campaña incluye {campaign.steps.length} paso{campaign.steps.length === 1 ? "" : "s"}.
          </p>
        </header>

        <ol className="mb-8 space-y-2">
          {[...campaign.steps]
            .sort((a, b) => a.order - b.order)
            .map((step, i) => (
              <li key={step.stepId} className="flex items-center gap-3 text-sm text-neutral-700">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                  {i + 1}
                </span>
                {step.instrument.name}
              </li>
            ))}
        </ol>

        <button
          type="button"
          onClick={handleStartPreview}
          className="w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          Iniciar vista previa
        </button>
      </main>
    );
  }

  if (state.phase === "instrument_loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">Cargando instrumento…</p>
      </div>
    );
  }

  if (state.phase === "instrument") {
    const { campaign, stepIndex, instrument } = state;
    const totalSteps = campaign.steps.length;
    const sortedSteps = [...campaign.steps].sort((a, b) => a.order - b.order);

    return (
      <div>
        <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2 text-xs text-neutral-600 text-center">
          Campaña: {campaign.name} — Paso {stepIndex + 1} de {totalSteps}: {sortedSteps[stepIndex]?.instrument.name}
        </div>
        <InstrumentQuestionFlow
          key={stepIndex}
          localId={`preview-step-${stepIndex}`}
          instrumentName={instrument.name}
          sections={instrument.sections}
          isOffline={false}
          apiBaseUrl={API_BASE_URL}
          previewMode
          onPreviewComplete={handleStepComplete}
        />
      </div>
    );
  }

  if (state.phase === "step_transition") {
    const { campaign, stepIndex } = state;
    const totalSteps = campaign.steps.length;
    const sortedSteps = [...campaign.steps].sort((a, b) => a.order - b.order);
    const nextStep = sortedSteps[stepIndex + 1];

    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-8 max-w-md mx-auto text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-7 text-green-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-1">
            Modo vista previa
          </p>
          <h2 className="text-xl font-bold text-neutral-900">
            Paso {stepIndex + 1} de {totalSteps} completado
          </h2>
          {nextStep && (
            <p className="mt-2 text-sm text-neutral-500">
              Siguiente: {nextStep.instrument.name}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleNextStep}
          className="w-full max-w-xs rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          Siguiente instrumento
        </button>
      </div>
    );
  }

  // phase === 'completed'
  const { campaign } = state;
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 p-8 max-w-md mx-auto text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-amber-100">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-7 text-amber-700">
          <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-1">
          Modo vista previa
        </p>
        <h2 className="text-xl font-bold text-neutral-900">
          Vista previa de campaña completada
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {campaign.name} — {campaign.steps.length} paso{campaign.steps.length === 1 ? "" : "s"} revisados.
          Ningún dato fue enviado al servidor.
        </p>
      </div>
      <p className="text-xs text-neutral-400">
        Redirigiendo en {countdown}…
      </p>
      <Link
        href="/admin/campaigns"
        className="rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800 transition-colors"
      >
        Volver al panel ahora
      </Link>
    </div>
  );
}
