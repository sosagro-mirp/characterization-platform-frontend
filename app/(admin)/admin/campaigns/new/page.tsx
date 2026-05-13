"use client";

import { useRouter } from "next/navigation";
import {
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from "@/app/(admin)/types";
import { createCampaign } from "@/services/campaigns.service";
import CampaignForm from "@/components/admin/campaigns/CampaignForm";
import AdminOnlyGuard from "@/components/auth/AdminOnlyGuard";

export default function NewCampaignPage() {
  const router = useRouter();

  async function handleSubmit(
    data: CreateCampaignRequest | UpdateCampaignRequest,
  ) {
    const created = await createCampaign(data as CreateCampaignRequest);
    router.push(`/admin/campaigns/${created.campaignId}`);
  }

  return (
    <AdminOnlyGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Nueva campaña
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Define el nombre y la descripción; los pasos se agregan después de
            crearla.
          </p>
        </div>
        <CampaignForm
          mode="create"
          onSubmit={handleSubmit}
          submitLabel="Crear campaña"
        />
      </div>
    </AdminOnlyGuard>
  );
}
