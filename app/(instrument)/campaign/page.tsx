"use client";

import { useEffect, useState } from "react";
import { CampaignActiveSummary } from "@/app/(instrument)/types";
import { listActiveCampaigns } from "@/services/campaigns.service";
import CampaignSelector from "@/components/campaign/CampaignSelector";

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<CampaignActiveSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCampaigns(await listActiveCampaigns());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar campañas.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Campañas</h1>
        <p className="mt-1 md:mt-6 text-sm text-text-muted">
          Selecciona una campaña para aplicarla en campo.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-[var(--danger-fg)]/30 bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger-fg)]">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : (
        <CampaignSelector campaigns={campaigns} />
      )}
    </main>
  );
}
