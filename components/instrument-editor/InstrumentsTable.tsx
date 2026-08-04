"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Eye, Pencil, Power, Search, Trash2 } from "lucide-react";
import { InstrumentListItem } from "@/app/(admin)/types";
import { deleteInstrument, updateInstrument } from "@/services/instruments.service";
import { useAuthStore } from "@/store/useAuthStore";
import Tooltip from "@/components/common/Tooltip";
import ConfirmDialog from "./ConfirmDialog";

interface InstrumentsTableProps {
  instruments: InstrumentListItem[];
}

export default function InstrumentsTable({ instruments }: InstrumentsTableProps) {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const [deleteTarget, setDeleteTarget] = useState<InstrumentListItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInstruments = instruments.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="relative mb-4 max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar instrumento por nombre…"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
        {filteredInstruments.length > 0 && (
          <table className="w-full text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2.5 text-left">Nombre</th>
                <th className="px-3 py-2.5 text-left">Actualizado el</th>
                <th className="px-3 py-2.5 text-left">Actores</th>
                <th className="px-3 py-2.5 text-left">Estado</th>
                <th className="px-3 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredInstruments.map((inst) => (
                <tr key={inst.instrumentId} className="hover:bg-[var(--surface-muted)]">
                  <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">
                    {inst.name}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--text-muted)]">
                    {new Date(inst.updatedAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {inst.actorTypes.map((a) => (
                        <span
                          key={a.actorTypeId}
                          className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10.5px] text-[var(--text-muted)]"
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${inst.isActive
                        ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                        : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                        }`}
                    >
                      {inst.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Tooltip label="Previsualizar el instrumento sin enviar datos">
                        <Link
                          href={`/instrument/${inst.instrumentId}?preview=true`}
                          target="_blank"
                          rel="noopener"
                          className="rounded-md p-1.5 text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                          aria-label="Previsualizar el instrumento sin enviar datos"
                        >
                          <Eye className="size-3.5" aria-hidden="true" />
                        </Link>
                      </Tooltip>
                      <Tooltip label="Editar instrumento">
                        <Link
                          href={`/admin/instruments/${inst.instrumentId}`}
                          className="rounded-md p-1.5 text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors"
                          aria-label="Editar instrumento"
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                        </Link>
                      </Tooltip>
                      {isAdmin && (
                        <>
                          <Tooltip label={inst.isActive ? "Desactivar instrumento" : "Activar instrumento"}>
                            <button
                              type="button"
                              disabled={loadingId === inst.instrumentId}
                              onClick={() => handleToggleActive(inst)}
                              className="rounded-md p-1.5 text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50"
                              aria-label={inst.isActive ? "Desactivar instrumento" : "Activar instrumento"}
                            >
                              <Power className="size-3.5" aria-hidden="true" />
                            </button>
                          </Tooltip>
                          <Tooltip label="Eliminar instrumento">
                            <button
                              type="button"
                              disabled={loadingId === inst.instrumentId}
                              onClick={() => setDeleteTarget(inst)}
                              className="rounded-md p-1.5 text-[var(--danger-fg)] border border-[var(--danger-fg)]/40 hover:bg-[var(--danger-bg)] transition-colors disabled:opacity-50"
                              aria-label="Eliminar instrumento"
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                            </button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredInstruments.length === 0 && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
              <ClipboardList className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
            </div>
            <p className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">
              {searchTerm ? `Sin resultados para “${searchTerm}”` : "Todavía no hay instrumentos"}
            </p>
            <p className="max-w-sm text-xs text-[var(--text-muted)]">
              {searchTerm
                ? "Probá con otro término o revisá la ortografía."
                : "Creá el primer instrumento para empezar a definir secciones y preguntas."}
            </p>
          </div>
        )}

        {filteredInstruments.length > 0 && (
          <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[10.5px] text-[var(--text-muted)]">
            <span>
              Mostrando {filteredInstruments.length} de {filteredInstruments.length}
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
        )}
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
