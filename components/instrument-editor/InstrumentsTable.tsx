"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InstrumentListItem } from "@/app/(admin)/types";
import { deleteInstrument, updateInstrument } from "@/services/instruments.service";
import ConfirmDialog from "./ConfirmDialog";

interface InstrumentsTableProps {
  instruments: InstrumentListItem[];
}

export default function InstrumentsTable({ instruments }: InstrumentsTableProps) {
  const router = useRouter();
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
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Versión</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Actores</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {instruments.map((inst) => (
              <tr key={inst.instrumentId} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {inst.name}
                </td>
                <td className="px-4 py-3 text-neutral-600">v{inst.version}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(inst.publishDate).toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {inst.actorTypes.map((a) => (
                      <span
                        key={a.actorTypeId}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
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
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {inst.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/admin/instruments/${inst.instrumentId}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-100 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      disabled={loadingId === inst.instrumentId}
                      onClick={() => handleToggleActive(inst)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                    >
                      {inst.isActive ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === inst.instrumentId}
                      onClick={() => setDeleteTarget(inst)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {instruments.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-neutral-500"
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
