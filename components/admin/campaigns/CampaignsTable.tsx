"use client";

import Link from "next/link";
import { CalendarClock, Eye, Pencil, Trash2 } from "lucide-react";
import { CampaignSummary } from "@/app/(admin)/types";
import Tooltip from "@/components/common/Tooltip";

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
      <div className="flex flex-col items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
          <CalendarClock className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
        </div>
        <p className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">
          Todavía no hay campañas
        </p>
        <p className="max-w-sm text-xs text-[var(--text-muted)]">
          Creá la primera campaña para empezar a levantar respuestas en campo.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-xs">
        <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <tr>
            <th className="px-3 py-2.5 text-left">Nombre</th>
            <th className="px-3 py-2.5 text-left">Estado</th>
            <th className="px-3 py-2.5 text-left">Creada</th>
            <th className="px-3 py-2.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {campaigns.map((c) => (
            <tr key={c.campaignId} className="hover:bg-[var(--surface-muted)] transition-colors">
              <td className="px-3 py-2.5 text-[var(--text-primary)] font-medium">
                {c.name}
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                    c.isActive
                      ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                      : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  {c.isActive ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td className="px-3 py-2.5 text-[var(--text-muted)]">
                {new Date(c.createdAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2.5 text-right">
                <div className="inline-flex items-center gap-1.5">
                  <Tooltip label="Previsualizar la campaña sin enviar datos">
                    <Link
                      href={`/campaign/${c.campaignId}/preview`}
                      target="_blank"
                      rel="noopener"
                      className="rounded-md p-1.5 text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                      aria-label="Previsualizar la campaña sin enviar datos"
                    >
                      <Eye className="size-3.5" aria-hidden="true" />
                    </Link>
                  </Tooltip>
                  <Tooltip label="Editar campaña">
                    <button
                      type="button"
                      onClick={() => onEdit(c.campaignId)}
                      className="rounded-md p-1.5 text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                      aria-label="Editar campaña"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </button>
                  </Tooltip>
                  {canDelete && (
                    <Tooltip label="Eliminar campaña">
                      <button
                        type="button"
                        onClick={() => onDelete(c)}
                        className="rounded-md p-1.5 text-[var(--danger-fg)] border border-[var(--danger-fg)]/40 hover:bg-[var(--danger-bg)] transition-colors"
                        aria-label="Eliminar campaña"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[10.5px] text-[var(--text-muted)]">
        <span>
          Mostrando {campaigns.length} de {campaigns.length}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled
            className="rounded px-2.5 py-1 text-[10.5px] text-[var(--text-muted)] border border-[var(--border)] disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled
            className="rounded px-2.5 py-1 text-[10.5px] text-[var(--text-muted)] border border-[var(--border)] disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
