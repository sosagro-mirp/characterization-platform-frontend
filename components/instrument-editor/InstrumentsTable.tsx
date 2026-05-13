"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InstrumentListItem } from "@/app/(admin)/types";
import { deleteInstrument, updateInstrument } from "@/services/instruments.service";
import { useAuthStore } from "@/store/useAuthStore";
import ConfirmDialog from "./ConfirmDialog";

interface InstrumentsTableProps {
  instruments: InstrumentListItem[];
}

export default function InstrumentsTable({ instruments }: InstrumentsTableProps) {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const [deleteTarget, setDeleteTarget] = useState<InstrumentListItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleActive = async (instrument: InstrumentListItem) => {
    setLoadingId(instrument.instrumentId);
    try {
      await updateInstrument(instrument.instrumentId, {
        isActive: !instrument.isActive,
      });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoadingId(deleteTarget.instrumentId);
    try {
      await deleteInstrument(deleteTarget.instrumentId);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Versión</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Actores</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {instruments.map((inst) => (
              <tr key={inst.instrumentId} className="hover:bg-[var(--surface-muted)]">
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                  {inst.name}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">v{inst.version}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {new Date(inst.publishDate).toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {inst.actorTypes.map((a) => (
                      <span
                        key={a.actorTypeId}
                        className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                      >
                        {a.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      inst.isActive
                        ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                        : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                    }`}
                  >
                    {inst.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {inst.isActive ? (
                      <Link
                        href={`/instrument/${inst.instrumentId}`}
                        target="_blank"
                        rel="noopener"
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors"
                        title="Iniciar una nueva sesión de encuesta con este instrumento"
                      >
                        Aplicar
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed"
                        title="Activa el instrumento para poder aplicarlo"
                      >
                        Aplicar
                      </span>
                    )}
                    <Link
                      href={`/admin/instruments/${inst.instrumentId}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                    >
                      Editar
                    </Link>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          disabled={loadingId === inst.instrumentId}
                          onClick={() => handleToggleActive(inst)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
                        >
                          {inst.isActive ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          type="button"
                          disabled={loadingId === inst.instrumentId}
                          onClick={() => setDeleteTarget(inst)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--danger-fg)] border border-[var(--danger-fg)]/40 hover:bg-[var(--danger-bg)] transition-colors disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {instruments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-[var(--text-muted)]"
                >
                  No hay instrumentos creados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar instrumento"
        description={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer. Si el instrumento tiene encuestas asociadas no podrá eliminarse.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
