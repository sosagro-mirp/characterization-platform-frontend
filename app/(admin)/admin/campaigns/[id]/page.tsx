"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CampaignDetail,
  CreateCampaignRequest,
  CropRef,
  InstrumentListItem,
  UpdateCampaignRequest,
} from "@/app/(admin)/types";
import {
  getCampaign,
  updateCampaign,
} from "@/services/campaigns.service";
import { getInstruments } from "@/services/instruments.service";
import { listCrops } from "@/services/types-of-crops.service";
import { useAuthStore } from "@/store/useAuthStore";
import CampaignForm from "@/components/admin/campaigns/CampaignForm";
import StepEditor from "@/components/admin/campaigns/StepEditor";

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [instruments, setInstruments] = useState<InstrumentListItem[]>([]);
  const [crops, setCrops] = useState<CropRef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loading = campaign === null && error === null;

  const refresh = useCallback(async () => {
    try {
      const [c, i, cr] = await Promise.all([
        getCampaign(campaignId),
        getInstruments({ excludeSystem: true }),
        listCrops(),
      ]);
      setCampaign(c);
      setInstruments(i);
      setCrops(cr.map((x) => ({ cropId: x.cropId, name: x.name })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar campaña.");
    }
  }, [campaignId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [c, i, cr] = await Promise.all([
          getCampaign(campaignId),
          getInstruments({ excludeSystem: true }),
          listCrops(),
        ]);
        if (cancelled) return;
        setCampaign(c);
        setInstruments(i);
        setCrops(cr.map((x) => ({ cropId: x.cropId, name: x.name })));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error al cargar campaña.");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [campaignId]);

  async function handleSave(
    data: CreateCampaignRequest | UpdateCampaignRequest,
  ) {
    try {
      const updated = await updateCampaign(campaignId, data as UpdateCampaignRequest);
      setCampaign(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios.");
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Cargando…</p>;
  }

  if (!campaign) {
    return (
      <p className="text-sm text-[var(--danger-fg)]">
        {error ?? "Campaña no encontrada."}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          {campaign.name}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {campaign.steps.length} paso{campaign.steps.length === 1 ? "" : "s"} configurado
          {campaign.steps.length === 1 ? "" : "s"}.
        </p>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          Datos generales
        </h2>
        <CampaignForm
          mode="edit"
          initial={campaign}
          onSubmit={handleSave}
          submitLabel="Guardar cambios"
          canToggleActive={isAdmin}
        />
      </section>

      <section>
        <StepEditor
          campaignId={campaignId}
          steps={campaign.steps}
          instruments={instruments}
          availableCrops={crops}
          onChanged={refresh}
        />
      </section>
    </div>
  );
}
