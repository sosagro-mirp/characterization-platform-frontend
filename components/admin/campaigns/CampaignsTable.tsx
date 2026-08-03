"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
    <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <tr>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Creada</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {campaigns.map((c) => (
            <tr key={c.campaignId} className="hover:bg-[var(--surface-muted)] transition-colors">
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
                <div className="inline-flex items-center gap-2">
                  <Link
                    href={`/campaign/${c.campaignId}/preview`}
                    target="_blank"
                    rel="noopener"
                    className="rounded-md p-1.5 text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                    title="Previsualizar la campaña sin enviar datos"
                    aria-label="Previsualizar la campaña sin enviar datos"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit(c.campaignId)}
                    className="rounded-md p-1.5 text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                    title="Editar campaña"
                    aria-label="Editar campaña"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(c)}
                      className="rounded-md p-1.5 text-[var(--danger-fg)] border border-[var(--danger-fg)]/40 hover:bg-[var(--danger-bg)] transition-colors"
                      title="Eliminar campaña"
                      aria-label="Eliminar campaña"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
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
