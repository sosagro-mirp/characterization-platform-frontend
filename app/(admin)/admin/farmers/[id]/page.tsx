"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { FarmerDetail, UpdateFarmerRequest, UpdateFarmRequest } from "@/app/(admin)/types";
import {
  deleteFarmerCascade,
  getFarmer,
  updateFarmer,
} from "@/services/farmers.service";
import { updateFarm } from "@/services/farms.service";
import { getFarmerConsentStatus } from "@/services/consents.service";
import type { ConsentStatus } from "@/lib/consents/resolveConsentRequirement";
import { listCrops } from "@/services/types-of-crops.service";
import { CropSummary } from "@/app/(instrument)/types";
import { SurveysTab } from "./SurveysTab";
import DeleteFarmerDialog from "./DeleteFarmerDialog";
import AdminOnly from "@/components/admin/AdminOnly";

type Tab = "datos" | "encuestas";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function EditFarmerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<Tab>("datos");
  const [farmer, setFarmer] = useState<FarmerDetail | null>(null);
  // Spec 78, Fase 13 — estado exacto de consentimiento (GET /api/farmers/:id
  // no lo trae; solo el listado GET /api/farmers agrega hasPendingConsent).
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);
  const [crops, setCrops] = useState<CropSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Farmer fields
  const [name, setName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Farm fields
  const [farmName, setFarmName] = useState("");
  const [vereda, setVereda] = useState("");
  const [altitude, setAltitude] = useState("");
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [f, c, consent] = await Promise.all([
          getFarmer(id),
          listCrops(),
          getFarmerConsentStatus(id),
        ]);
        if (cancelled) return;
        setFarmer(f);
        setCrops(c);
        setConsentStatus(consent);
        setName(f.name ?? "");
        setDocumentId(f.documentId ?? "");
        setPhone(f.phone ?? "");
        setEmail(f.email ?? "");
        if (f.farm) {
          setFarmName(f.farm.name ?? "");
          setVereda(f.farm.vereda ?? "");
          setAltitude(f.farm.altitude != null ? String(f.farm.altitude) : "");
          setSelectedCropIds((f.farm.crops ?? []).map((c) => c.cropId));
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error al cargar agricultor.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  function toggleCrop(cropId: string) {
    setSelectedCropIds((prev) =>
      prev.includes(cropId) ? prev.filter((c) => c !== cropId) : [...prev, cropId],
    );
  }

  async function handleSave() {
    if (!farmer) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const farmerPayload: UpdateFarmerRequest = {
        name: name.trim() || undefined,
        documentId: documentId.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      };
      await updateFarmer(id, farmerPayload);

      if (farmer.farm) {
        const farmPayload: UpdateFarmRequest = {
          name: farmName.trim() || undefined,
          vereda: vereda.trim() || undefined,
          altitude: altitude !== "" ? Number(altitude) : undefined,
          cropIds: selectedCropIds,
        };
        await updateFarm(farmer.farm.farmId, farmPayload);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCascade() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteFarmerCascade(id);
      router.push("/admin/farmers");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Error al eliminar el agricultor.",
      );
      setDeleting(false);
    }
  }

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Cargando…</p>;

  if (!farmer) {
    return (
      <p className="text-sm text-[var(--danger-fg)]">
        {error ?? "Agricultor no encontrado."}
      </p>
    );
  }

  const locationParts = [
    farmer.documentId ? `CC ${farmer.documentId}` : null,
    farmer.farm?.name ?? null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin/farmers")}
        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Volver al listado
      </button>

      {/* Header */}
      <div className="flex items-center gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--brand-subtle-bg)] text-sm font-bold text-[var(--brand-subtle-fg)]">
          {initials(farmer.name)}
        </span>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {farmer.name}
          </h1>
          {locationParts.length > 0 && (
            <p className="text-xs text-[var(--text-muted)]">{locationParts.join(" · ")}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {(["datos", "encuestas"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab === "datos" ? "Datos" : "Encuestas"}
          </button>
        ))}
      </div>

      {/* Tab: Datos */}
      {activeTab === "datos" && (
        <div className="space-y-5">
          {error && (
            <p className="text-sm text-[var(--danger-fg)] rounded-md bg-[var(--danger-bg)] px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-md border border-[var(--success-fg)]/30 bg-[var(--success-bg)] px-3.5 py-2.5 text-sm text-[var(--success-fg)]">
              <Check className="size-4 shrink-0" aria-hidden="true" />
              Los datos del agricultor se actualizaron correctamente.
            </div>
          )}

          {/* Spec 78, Fase 13 — estado exacto de consentimiento informado. */}
          {consentStatus && (
            <div
              className={`flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-xs ${
                consentStatus.status === "valid"
                  ? "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
                  : "border-[var(--warning-fg)]/30 bg-[var(--warning-bg)] text-[var(--warning-fg)]"
              }`}
            >
              <span className="font-semibold">Consentimiento informado:</span>
              <span>
                {consentStatus.status === "valid" && `vigente (v${consentStatus.acceptedVersion})`}
                {consentStatus.status === "outdated_version" &&
                  `pendiente — versión aceptada (v${consentStatus.acceptedVersion}) quedó desactualizada`}
                {consentStatus.status === "revoked" && "pendiente — revocado"}
                {consentStatus.status === "none" && "pendiente — nunca se registró"}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Datos del agricultor */}
            <section className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
              <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
                <h2 className="text-xs font-semibold text-[var(--text-primary)]">
                  Datos del agricultor
                </h2>
              </div>
              <div className="flex flex-col gap-4 p-4">
                <Field label="Nombre completo" required>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Número de documento">
                  <input value={documentId} onChange={(e) => setDocumentId(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Teléfono">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Correo electrónico">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </Field>
              </div>
            </section>

            {/* Datos de la finca */}
            {farmer.farm && (
              <section className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
                  <h2 className="text-xs font-semibold text-[var(--text-primary)]">
                    Datos de la finca
                  </h2>
                </div>
                <div className="flex flex-col gap-4 p-4">
                  <Field label="Nombre de la finca">
                    <input value={farmName} onChange={(e) => setFarmName(e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Vereda / Sector">
                    <input value={vereda} onChange={(e) => setVereda(e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Altitud (m.s.n.m.)">
                    <input
                      type="number"
                      min={0}
                      value={altitude}
                      onChange={(e) => setAltitude(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <div>
                    <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Cultivos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {crops.map((crop) => {
                        const selected = selectedCropIds.includes(crop.cropId);
                        return (
                          <button
                            key={crop.cropId}
                            type="button"
                            onClick={() => toggleCrop(crop.cropId)}
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                              selected
                                ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-foreground)]"
                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--brand)]"
                            }`}
                          >
                            {crop.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="rounded-md bg-[var(--brand)] px-5 py-2 text-sm font-medium text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              onClick={() => router.push("/admin/farmers")}
              className="rounded-md border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
            >
              Cancelar
            </button>
            <AdminOnly>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="ml-auto rounded-xl border border-[var(--danger-fg)]/40 px-4 py-2 text-sm font-medium text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] transition-colors"
              >
                Eliminar agricultor
              </button>
            </AdminOnly>
          </div>
        </div>
      )}

      {/* Tab: Encuestas */}
      {activeTab === "encuestas" && <SurveysTab farmerId={id} />}

      {confirmDelete && (
        <DeleteFarmerDialog
          farmerId={id}
          deleting={deleting}
          error={deleteError}
          onConfirm={handleDeleteCascade}
          onCancel={() => {
            setConfirmDelete(false);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]";

function Field({
  label,
  children,
  className,
  required,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs text-[var(--text-muted)]">
        {label} {required && <span className="text-[var(--danger-fg)]">*</span>}
      </label>
      {children}
    </div>
  );
}
