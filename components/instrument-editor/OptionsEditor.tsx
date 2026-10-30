"use client";

import { useState } from "react";
import { Archive, ArchiveRestore, Link2, Plus, Trash2 } from "lucide-react";
import { OptionDetail } from "@/app/(admin)/types";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";
import { ApiError } from "@/lib/apiClient";
import ConfirmDialog from "./ConfirmDialog";
import { useSystemFieldCatalog } from "@/hooks/useSystemFieldCatalog";
import {
  METADATA_CATALOG_LABELS,
  useMetadataCatalog,
} from "@/hooks/useMetadataCatalog";
import { metadataCatalogFor } from "@/lib/system-fields/systemFieldOptions";

interface OptionsEditorProps {
  questionId: string;
  sectionId: string;
  options: OptionDetail[];
  /** Destino de la pregunta (spec 97): fija el catálogo al que pueden apuntar las opciones. */
  systemField?: string | null;
}

export default function OptionsEditor({
  questionId,
  sectionId,
  options,
  systemField,
}: OptionsEditorProps) {
  const {
    addOptions,
    updateOptionInStore,
    removeOptionFromStore,
    archiveOptionInStore,
    unarchiveOptionInStore,
    showArchived,
  } = useInstrumentEditorStore();
  const [newText, setNewText] = useState("");
  // Spec 84 — 409 al borrar: la opción tiene respuestas. Se ofrece archivar.
  const [archiveInsteadOptionId, setArchiveInsteadOptionId] = useState<string | null>(null);

  // Spec 97 — el destino fija el catálogo (cultivo, municipio…) de `metadataId`.
  // Solo se abre el selector de una opción a la vez: una pregunta de municipios
  // tiene más de mil opciones y un selector por fila no sería usable.
  const { catalog } = useSystemFieldCatalog();
  const metadataKind = systemField ? metadataCatalogFor(catalog, systemField) : null;
  const { entries: metadataEntries, loading: metadataLoading } =
    useMetadataCatalog(metadataKind);
  const [editingMetadataOptionId, setEditingMetadataOptionId] = useState<string | null>(null);
  const metadataNameById = new Map(metadataEntries.map((e) => [e.id, e.name]));

  const handleMetadataChange = async (option: OptionDetail, metadataId: string) => {
    setEditingMetadataOptionId(null);
    const next = metadataId || null;
    if (next === (option.metadataId ?? null)) return;
    await updateOptionInStore(questionId, sectionId, option.optionId, {
      metadataId: next,
    });
  };

  const hasOtherOption = options.some((o) => o.isOther);
  const visibleOptions = options.filter((o) => showArchived || !o.archivedAt);

  const handleDelete = async (optionId: string) => {
    try {
      await removeOptionFromStore(questionId, sectionId, optionId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setArchiveInsteadOptionId(optionId);
      } else {
        alert(err instanceof Error ? err.message : "No se pudo eliminar la opción.");
      }
    }
  };

  const handleToggleArchive = async (option: OptionDetail) => {
    try {
      if (option.archivedAt) {
        await unarchiveOptionInStore(questionId, sectionId, option.optionId);
      } else {
        await archiveOptionInStore(questionId, sectionId, option.optionId);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo archivar la opción.");
    }
  };

  const handleAdd = async () => {
    const text = newText.trim();
    if (!text) return;
    await addOptions(questionId, sectionId, [{ text }]);
    setNewText("");
  };

  const handleAddOther = async () => {
    if (hasOtherOption) return;
    await addOptions(questionId, sectionId, [
      { text: "Otros", isOther: true },
    ]);
  };

  const handleTextBlur = async (option: OptionDetail, value: string) => {
    if (value.trim() === option.text) return;
    await updateOptionInStore(questionId, sectionId, option.optionId, {
      text: value.trim(),
    });
  };

  return (
    <div className="mt-4">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Opciones de respuesta</p>
        <span className="text-[10.5px] text-[var(--text-muted)]">
          {options.length} opci{options.length === 1 ? "ón" : "ones"}
        </span>
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--border)]">
        {visibleOptions.map((opt, idx) => (
          <div
            key={opt.optionId}
            className={`flex items-center gap-2.5 border-b border-[var(--border)] px-3 py-2 ${
              opt.archivedAt ? "opacity-60" : ""
            }`}
          >
            <span className="w-3.5 shrink-0 text-[10.5px] text-[var(--text-muted)]">
              {idx + 1}
            </span>
            <input
              type="text"
              defaultValue={opt.text}
              onBlur={(e) => handleTextBlur(opt, e.target.value)}
              className="flex-1 border-none bg-transparent text-sm text-[var(--text-primary)] outline-none"
            />
            {metadataKind && !opt.isOther && (
              editingMetadataOptionId === opt.optionId ? (
                <select
                  autoFocus
                  value={opt.metadataId ?? ""}
                  onChange={(e) => handleMetadataChange(opt, e.target.value)}
                  onBlur={() => setEditingMetadataOptionId(null)}
                  aria-label={`Vincular opción a ${METADATA_CATALOG_LABELS[metadataKind]}`}
                  className="max-w-[14rem] shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                >
                  <option value="">Sin vínculo</option>
                  {metadataEntries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingMetadataOptionId(opt.optionId)}
                  disabled={metadataLoading}
                  className={`flex max-w-[12rem] shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] whitespace-nowrap transition-colors disabled:opacity-60 ${
                    opt.metadataId
                      ? "bg-[var(--brand-subtle-bg)] text-[var(--brand-subtle-fg)]"
                      : "border border-dashed border-[var(--border-strong)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                  }`}
                  title={`Vincular esta opción a un ${METADATA_CATALOG_LABELS[metadataKind]} del catálogo`}
                  aria-label={`Vincular opción a ${METADATA_CATALOG_LABELS[metadataKind]}`}
                >
                  <Link2 className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {opt.metadataId
                      ? (metadataNameById.get(opt.metadataId) ?? "Vinculada")
                      : `Sin ${METADATA_CATALOG_LABELS[metadataKind]}`}
                  </span>
                </button>
              )
            )}
            {opt.archivedAt && (
              <span
                className="shrink-0 rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-muted)] whitespace-nowrap"
                title="Spec 84 — no se muestra en campo; sus respuestas se conservan"
              >
                Archivada
              </span>
            )}
            {opt.isOther && (
              <span className="shrink-0 rounded bg-[var(--info-bg)] px-1.5 py-0.5 text-[9px] text-[var(--info-fg)] whitespace-nowrap">
                Otro (texto libre)
              </span>
            )}
            <button
              type="button"
              onClick={() => handleToggleArchive(opt)}
              className="shrink-0 rounded p-1 text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
              title={opt.archivedAt ? "Desarchivar" : "Archivar"}
              aria-label={opt.archivedAt ? "Desarchivar opción" : "Archivar opción"}
            >
              {opt.archivedAt ? (
                <ArchiveRestore className="size-3.5" aria-hidden="true" />
              ) : (
                <Archive className="size-3.5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(opt.optionId)}
              className="shrink-0 rounded p-1 text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger-fg)] transition-colors"
              title="Eliminar opción"
              aria-label="Eliminar opción"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2.5 bg-[var(--surface-muted)] px-3 py-2">
          <input
            type="text"
            placeholder="Texto de la nueva opción"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="shrink-0 rounded-md bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-40"
          >
            Agregar
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddOther}
        disabled={hasOtherOption}
        className="mt-2 flex w-full items-center gap-1.5 rounded-md border border-dashed border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--brand)] hover:bg-[var(--brand-subtle-bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={hasOtherOption ? "Esta pregunta ya tiene una opción Otros" : undefined}
      >
        <Plus className="size-3.5 shrink-0" aria-hidden="true" />
        Agregar opción &quot;Otros&quot;
      </button>

      <ConfirmDialog
        open={archiveInsteadOptionId !== null}
        title="Esta opción ya tiene respuestas"
        description="No se puede borrar una opción con respuestas. Se puede archivar: deja de mostrarse en campo, pero las respuestas ya guardadas se conservan."
        confirmLabel="Archivar"
        onConfirm={async () => {
          const optionId = archiveInsteadOptionId;
          setArchiveInsteadOptionId(null);
          if (optionId) {
            try {
              await archiveOptionInStore(questionId, sectionId, optionId);
            } catch (err) {
              alert(err instanceof Error ? err.message : "No se pudo archivar la opción.");
            }
          }
        }}
        onCancel={() => setArchiveInsteadOptionId(null)}
      />
    </div>
  );
}
