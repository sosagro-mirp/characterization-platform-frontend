"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CampaignRender } from "@/app/(instrument)/types";
import { getCampaignRender } from "@/services/campaigns.service";
import { createSession } from "@/services/campaign-sessions.service";
import { useCampaignSessionStore } from "@/store/useCampaignSessionStore";
import PreSurveyForm from "@/components/campaign/PreSurveyForm";

type Step = "intro" | "pre-survey" | "starting";

export default function CampaignIntroPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;
  const startSession = useCampaignSessionStore((s) => s.startSession);

  const [campaign, setCampaign] = useState<CampaignRender | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("intro");

  useEffect(() => {
    getCampaignRender(campaignId)
      .then(setCampaign)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar campaña."),
      )
      .finally(() => setLoadingCampaign(false));
  }, [campaignId]);

  async function launchSession(farmerId: string | null) {
    if (!campaign) return;
    setStep("starting");
    setError(null);
    try {
      const session = await createSession({
        campaignId,
        farmerId: farmerId ?? undefined,
      });
      startSession({
        sessionId: session.sessionId,
        campaignId,
        campaignName: campaign.name,
        farmerId,
        farmerName: null,
      });
      router.replace(`/campaign/${campaignId}/session/${session.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
      setStep("intro");
    }
  }

  function handleSearchSelect(farmerId: string) {
    launchSession(farmerId);
  }

  function handleNewFarmer() {
    launchSession(null);
  }

  function handleContinueLast(farmerId: string) {
    launchSession(farmerId);
  }

  if (loadingCampaign) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <p className="text-sm text-neutral-500">Cargando campaña…</p>
      </main>
    );
  }

  if (error && step !== "starting") {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      </main>
    );
  }

  if (!campaign) return null;

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{campaign.name}</h1>
        {campaign.description && (
          <p className="mt-2 text-sm text-neutral-600">{campaign.description}</p>
        )}
        <p className="mt-4 text-xs text-neutral-500">
          Esta campaña incluye {(campaign.steps ?? []).length} paso
          {(campaign.steps ?? []).length === 1 ? "" : "s"}.
        </p>
      </header>

      {step === "intro" && (
        <button
          type="button"
          onClick={() => setStep("pre-survey")}
          className="w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          Comenzar
        </button>
      )}

      {step === "pre-survey" && (
        <section>
          <h2 className="text-base font-semibold text-neutral-800 mb-4">
            Identificación del encuestado
          </h2>
          <PreSurveyForm
            onSearchSelect={handleSearchSelect}
            onNewFarmer={handleNewFarmer}
            onContinueLast={handleContinueLast}
          />
        </section>
      )}

      {step === "starting" && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="h-8 w-8 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
          <p className="text-sm text-neutral-500">Iniciando campaña…</p>
        </div>
      )}
    </main>
  );
}
