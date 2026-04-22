"use client";

import { useState } from "react";
import { ActorTypeSummary, CreateInstrumentRequest, UpdateInstrumentRequest } from "@/app/(admin)/types";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";

interface InstrumentFormProps {
  actorTypes: ActorTypeSummary[];
  initialValues?: {
    name: string;
    version: number;
    publishDate: string;
    isActive: boolean;
    actorTypeIds: string[];
  };
  onSubmit: (data: CreateInstrumentRequest | UpdateInstrumentRequest) => Promise<void>;
  submitLabel?: string;
}

export default function InstrumentForm({
  actorTypes,
  initialValues,
  onSubmit,
  submitLabel = "Guardar",
}: InstrumentFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [version, setVersion] = useState(initialValues?.version ?? 1);
  const [publishDate, setPublishDate] = useState(
    initialValues?.publishDate ?? new Date().toISOString().slice(0, 10)
  );
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [selectedActorTypeIds, setSelectedActorTypeIds] = useState<string[]>(
    initialValues?.actorTypeIds ?? []
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleActorType = (id: string) => {
    setSelectedActorTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    setErrorMessage(undefined);
    try {
      await onSubmit({
        name: name.trim(),
        version,
        publishDate,
        isActive,
        actorTypeIds: selectedActorTypeIds,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al guardar");
      setSaveStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          required
          maxLength={255}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Versión
          </label>
          <input
            type="number"
            required
            min={1}
            value={version}
            onChange={(e) => setVersion(Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Fecha de publicación
          </label>
          <input
            type="date"
            required
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 accent-green-700"
        />
        <label htmlFor="isActive" className="text-sm text-neutral-700">
          Instrumento activo (visible para encuestadores)
        </label>
      </div>

      {actorTypes.length > 0 && (
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Tipos de actor
          </p>
          <div className="flex flex-wrap gap-2">
            {actorTypes.map((at) => (
              <button
                key={at.actorTypeId}
                type="button"
                onClick={() => toggleActorType(at.actorTypeId)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  selectedActorTypeIds.includes(at.actorTypeId)
                    ? "bg-green-700 border-green-700 text-white"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {at.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saveStatus === "saving"}
          className="rounded-xl bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors disabled:opacity-50"
        >
          {submitLabel}
        </button>
        <SaveStatusIndicator status={saveStatus} errorMessage={errorMessage} />
      </div>
    </form>
  );
}
