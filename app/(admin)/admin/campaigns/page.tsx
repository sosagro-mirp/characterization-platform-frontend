"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CampaignSummary } from "@/app/(admin)/types";
import {
  deleteCampaign,
  listCampaigns,
} from "@/services/campaigns.service";
import { useAuthStore } from "@/store/useAuthStore";
import CampaignsTable from "@/components/admin/campaigns/CampaignsTable";
import AdminOnly from "@/components/admin/AdminOnly";
import ConfirmDialog from "@/components/instrument-editor/ConfirmDialog";

export default function CampaignsListPage() {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<CampaignSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setCampaigns(await listCampaigns());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar campañas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleConfirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteCampaign(toDelete.campaignId);
      setToDelete(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Campañas
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Listas ordenadas de instrumentos aplicadas en flujo.
          </p>
        </div>
        <AdminOnly>
          <Link
            href="/admin/campaigns/new"
            className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors"
          >
            Nueva campaña
          </Link>
        </AdminOnly>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : (
        <CampaignsTable
          campaigns={campaigns}
          onEdit={(campaignId) => router.push(`/admin/campaigns/${campaignId}`)}
          onDelete={(c) => setToDelete(c)}
          canDelete={isAdmin}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar campaña"
        description={
          toDelete
            ? `¿Eliminar la campaña "${toDelete.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel={deleting ? "Eliminando…" : "Sí, eliminar"}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
