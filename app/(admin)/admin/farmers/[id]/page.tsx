"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FarmerDetail, UpdateFarmerRequest, UpdateFarmRequest } from "@/app/(admin)/types";
import { getFarmer, updateFarmer } from "@/services/farmers.service";
import { updateFarm } from "@/services/farms.service";
import { listCrops } from "@/services/types-of-crops.service";
import { CropSummary } from "@/app/(instrument)/types";

export default function EditFarmerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [farmer, setFarmer] = useState<FarmerDetail | null>(null);
  const [crops, setCrops] = useState<CropSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Farmer fields
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
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
        const [f, c] = await Promise.all([getFarmer(id), listCrops()]);
        if (cancelled) return;
        setFarmer(f);
        setCrops(c);
        setName(f.name ?? "");
        setLastName(f.lastName ?? "");
        setDocumentId(f.documentId ?? "");
        setPhone(f.phone ?? "");
        setEmail(f.email ?? "");
        if (f.farm) {
          setFarmName(f.farm.name ?? "");
          setVereda(f.farm.vereda ?? "");
          setAltitude(f.farm.altitude != null ? String(f.farm.altitude) : "");
          setSelectedCropIds(f.farm.crops.map((c) => c.cropId));
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
        lastName: lastName.trim() || undefined,
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

  if (loading) return <p className="text-sm text-[var(--text-muted)]">Cargando…</p>;

  if (!farmer) {
    return (
      <p className="text-sm text-[var(--danger-fg)]">
        {error ?? "Agricultor no encontrado."}
      </p>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <button
          onClick={() => router.push("/admin/farmers")}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4 flex items-center gap-1"
        >
          ← Volver al listado
        </button>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Editar agricultor
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {farmer.name}{farmer.lastName ? ` ${farmer.lastName}` : ""}
        </p>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-[var(--success-fg)] rounded-lg bg-[var(--success-bg)] px-3 py-2">
          Cambios guardados correctamente.
        </p>
      )}

      {/* Datos del agricultor */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Datos del agricultor
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre completo *">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Apellido">
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Número de documento">
            <input value={documentId} onChange={(e) => setDocumentId(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Teléfono">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Correo electrónico" className="sm:col-span-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      {/* Datos de la finca */}
      {farmer.farm && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Datos de la finca
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre de la finca" className="sm:col-span-2">
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
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Cultivos</p>
            <div className="flex flex-wrap gap-2">
              {crops.map((crop) => {
                const selected = selectedCropIds.includes(crop.cropId);
                return (
                  <button
                    key={crop.cropId}
                    type="button"
                    onClick={() => toggleCrop(crop.cropId)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      selected
                        ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                        : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--brand)]"
                    }`}
                  >
                    {crop.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="rounded-xl bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          onClick={() => router.push("/admin/farmers")}
          className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
