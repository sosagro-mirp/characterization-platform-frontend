"use client";

import { useState } from "react";
import {
  CampaignDetail,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from "@/app/(admin)/types";

type Mode = "create" | "edit";

interface CampaignFormProps {
  mode: Mode;
  initial?: CampaignDetail;
  onSubmit: (data: CreateCampaignRequest | UpdateCampaignRequest) => Promise<void>;
  submitLabel?: string;
  canToggleActive?: boolean;
}

export default function CampaignForm({
  mode,
  initial,
  onSubmit,
  submitLabel,
  canToggleActive = true,
}: CampaignFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        await onSubmit({
          name: name.trim(),
          description: description.trim() || undefined,
          isActive,
        });
      } else {
        const patch: UpdateCampaignRequest = {};
        if (name.trim() !== initial?.name) patch.name = name.trim();
        if ((description.trim() || undefined) !== (initial?.description ?? undefined)) {
          patch.description = description.trim() || undefined;
        }
        if (canToggleActive && isActive !== initial?.isActive) patch.isActive = isActive;
        await onSubmit(patch);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Nombre <span className="text-[var(--danger-fg)]">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={255}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Descripción
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>

      {canToggleActive && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="campaignIsActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border)] accent-green-700"
          />
          <label
            htmlFor="campaignIsActive"
            className="text-sm text-[var(--text-primary)]"
          >
            Campaña activa (visible para encuestadores)
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando…" : submitLabel ?? "Guardar"}
      </button>
    </form>
  );
}
