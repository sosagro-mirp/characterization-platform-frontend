"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CampaignRender } from "@/app/(instrument)/types";
import { getCampaignRender } from "@/services/campaigns.service";
import { createSession } from "@/services/campaign-sessions.service";
import { useCampaignSessionStore } from "@/store/useCampaignSessionStore";

export default function CampaignIntroPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;
  const startSession = useCampaignSessionStore((s) => s.startSession);

  const [campaign, setCampaign] = useState<CampaignRender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setCampaign(await getCampaignRender(campaignId));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar campaña.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId]);

  async function handleStart() {
    if (!campaign) return;
    setCreating(true);
    setError(null);
    try {
      const session = await createSession({ campaignId });
      startSession({
        sessionId: session.sessionId,
        campaignId,
        campaignName: campaign.name,
      });
      router.replace(`/campaign/${campaignId}/session/${session.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      {loading ? (
        <p className="text-sm text-neutral-500">Cargando campaña…</p>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : campaign ? (
        <>
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="mt-2 text-sm text-neutral-600">
                {campaign.description}
              </p>
            )}
            <p className="mt-4 text-xs text-neutral-500">
              Esta campaña incluye {campaign.steps.length} paso
              {campaign.steps.length === 1 ? "" : "s"}.
            </p>
          </header>

          <section className="space-y-4">
            <button
              type="button"
              onClick={handleStart}
              disabled={creating}
              className="w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800 transition-colors disabled:opacity-60"
            >
              {creating ? "Iniciando…" : "Iniciar campaña"}
            </button>
          </section>
        </>
      ) : null}
    </main>
  );
}
