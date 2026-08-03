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
        <p className="text-sm text-text-muted">Cargando campaña…</p>
      </main>
    );
  }

  if (error && step !== "starting") {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <p className="rounded-xl border border-[var(--danger-fg)]/30 bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      </main>
    );
  }

  if (!campaign) return null;

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{campaign.name}</h1>
        {campaign.description && (
          <p className="mt-2 text-sm text-text-muted">{campaign.description}</p>
        )}
        <p className="mt-4 text-xs text-text-muted">
          Esta campaña incluye {(campaign.steps ?? []).length} paso
          {(campaign.steps ?? []).length === 1 ? "" : "s"}.
        </p>
      </header>

      {step === "intro" && (
        <button
          type="button"
          onClick={() => setStep("pre-survey")}
          className="w-full rounded-xl bg-brand px-5 py-3 text-sm font-medium text-brand-foreground hover:bg-brand-hover transition-colors"
        >
          Comenzar
        </button>
      )}

      {step === "pre-survey" && (
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-4">
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
          <div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted">Iniciando campaña…</p>
        </div>
      )}
    </main>
  );
}
