"use client";

import Link from "next/link";
import { CampaignSummary } from "@/app/(admin)/types";

interface CampaignsTableProps {
  campaigns: CampaignSummary[];
  onEdit: (campaignId: string) => void;
  onDelete: (campaign: CampaignSummary) => void;
  canDelete: boolean;
}

export default function CampaignsTable({
  campaigns,
  onEdit,
  onDelete,
  canDelete,
}: CampaignsTableProps) {
  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-12 text-center">
        No hay campañas todavía.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Creada</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr
              key={c.campaignId}
              className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]/40 transition-colors"
            >
              <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                {c.name}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.isActive
                      ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                      : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  {c.isActive ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {new Date(c.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-2">
                  <Link
                    href={`/campaign/${c.campaignId}/preview`}
                    target="_blank"
                    rel="noopener"
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
                    title="Previsualizar la campaña sin enviar datos"
                  >
                    Vista previa
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit(c.campaignId)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    Editar
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(c)}
                      className="rounded-lg border border-[var(--danger-fg)]/40 px-3 py-1 text-xs font-medium text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
