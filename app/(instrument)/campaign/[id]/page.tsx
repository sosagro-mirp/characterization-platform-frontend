"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CampaignRender } from "@/app/(instrument)/types";
import { getCampaignRender } from "@/services/campaigns.service";
import { createSession } from "@/services/campaign-sessions.service";
import { getFarmerConsentStatus } from "@/services/consents.service";
import { resolveConsentRequirement } from "@/lib/consents/resolveConsentRequirement";
import { useCampaignSessionStore } from "@/store/useCampaignSessionStore";
import PreSurveyForm from "@/components/campaign/PreSurveyForm";
import ConsentForm from "@/components/campaign/ConsentForm";
import type { ConsentRecord } from "@/services/consents.service";

type Step = "intro" | "pre-survey" | "consent" | "starting";

export default function CampaignIntroPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;
  const startSession = useCampaignSessionStore((s) => s.startSession);
  const setConsent = useCampaignSessionStore((s) => s.setConsent);

  const [campaign, setCampaign] = useState<CampaignRender | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("intro");
  // sessionId de la sesión ya creada, esperando consentimiento antes de navegar.
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  // Nombre del encuestado ya identificado (spec 78, hallazgo F3), para
  // precargar el campo "Nombre de quien acepta" en ConsentForm.
  const [pendingFarmerName, setPendingFarmerName] = useState<string | undefined>(undefined);

  useEffect(() => {
    getCampaignRender(campaignId)
      .then(setCampaign)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar campaña."),
      )
      .finally(() => setLoadingCampaign(false));
  }, [campaignId]);

  function navigateToSession(sessionId: string) {
    router.replace(`/campaign/${campaignId}/session/${sessionId}`);
  }

  async function launchSession(farmerId: string | null, farmerName?: string) {
    if (!campaign) return;
    setStep("starting");
    setError(null);
    setPendingFarmerName(farmerName);
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
        farmerName: farmerName ?? null,
      });

      // Spec 78 — un encuestado nuevo siempre necesita consentimiento; uno
      // conocido solo si su última constancia no está vigente para la
      // versión actualmente publicada.
      const consentStatus = farmerId ? await getFarmerConsentStatus(farmerId) : null;
      const needsConsent = resolveConsentRequirement({
        mode: farmerId ? "existing" : "new",
        consentStatus,
      });

      if (needsConsent) {
        setPendingSessionId(session.sessionId);
        setStep("consent");
        return;
      }

      navigateToSession(session.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
      setStep("intro");
    }
  }

  function handleSearchSelect(farmerId: string, farmerName: string) {
    launchSession(farmerId, farmerName);
  }

  function handleNewFarmer() {
    launchSession(null);
  }

  function handleContinueLast(farmerId: string, farmerName: string) {
    launchSession(farmerId, farmerName);
  }

  function handleConsentAccepted(record: ConsentRecord) {
    if (!pendingSessionId) return;
    setConsent(record.consentRecordId, record.consentDocument.version);
    navigateToSession(pendingSessionId);
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

      {step === "consent" && pendingSessionId && (
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Consentimiento informado
          </h2>
          <ConsentForm
            sessionId={pendingSessionId}
            defaultRespondentName={pendingFarmerName}
            onAccepted={handleConsentAccepted}
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
