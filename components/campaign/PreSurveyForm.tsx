"use client";

import { useEffect, useRef, useState } from "react";
import { CropSummary, FarmerSearchResult } from "@/app/(instrument)/types";
import { searchFarmers, createFarmer } from "@/services/farmers.service";
import { listCrops } from "@/services/types-of-crops.service";
import {
  listDepartments,
  DepartmentSummary,
} from "@/services/departments.service";
import { listTowns, TownSummary } from "@/services/towns.service";

interface PreSurveyFormProps {
  onComplete: (farmerId: string | null, cropIds: string[]) => void;
  onSkip: () => void;
}

const EMPTY_FIELDS = {
  name: "",
  lastName: "",
  documentId: "",
  phone: "",
  email: "",
  farmName: "",
  departmentId: "",
  townId: "",
  vereda: "",
  latitude: "",
  longitude: "",
  altitude: "",
};

export default function PreSurveyForm({ onComplete, onSkip }: PreSurveyFormProps) {
  const [mode, setMode] = useState<"search" | "create">("search");
  const [step, setStep] = useState<"identify" | "s2">("identify");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FarmerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selected farmer
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerSearchResult | null>(null);

  // Create form fields
  const [fields, setFields] = useState(EMPTY_FIELDS);

  // Catalogs
  const [crops, setCrops] = useState<CropSummary[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [towns, setTowns] = useState<TownSummary[]>([]);

  // S2 selection
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>([]);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listCrops().then(setCrops).catch(() => {});
    listDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    if (!fields.departmentId) {
      setTowns([]);
      setFields((f) => ({ ...f, townId: "" }));
      return;
    }
    listTowns(fields.departmentId).then(setTowns).catch(() => {});
  }, [fields.departmentId]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchFarmers(searchQuery.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));
    setError(null);
  }

  function handleSelectFarmer(farmer: FarmerSearchResult) {
    setSelectedFarmer(farmer);
    setSearchResults([]);
    setStep("s2");
  }

  async function handleCreateFarmer() {
    if (!fields.name.trim() || !fields.lastName.trim() || !fields.documentId.trim()) {
      setError("Nombre, apellido y número de documento son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const farmer = await createFarmer({
        name: fields.name.trim(),
        lastName: fields.lastName.trim(),
        documentId: fields.documentId.trim(),
        phone: fields.phone || undefined,
        email: fields.email || undefined,
        farmName: fields.farmName || undefined,
        townId: fields.townId || undefined,
        latitude: fields.latitude ? parseFloat(fields.latitude) : undefined,
        longitude: fields.longitude ? parseFloat(fields.longitude) : undefined,
        altitude: fields.altitude ? parseFloat(fields.altitude) : undefined,
      });
      setSelectedFarmer(farmer);
      setStep("s2");
    } catch {
      setError("No se pudo crear el agricultor. Verifique los datos e intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function toggleCrop(cropId: string) {
    setSelectedCropIds((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId],
    );
    setError(null);
  }

  function handleStart() {
    if (selectedCropIds.length === 0) {
      setError("Selecciona al menos un cultivo para continuar.");
      return;
    }
    onComplete(selectedFarmer?.id ?? null, selectedCropIds);
  }

  function handleModeChange(next: "search" | "create") {
    setMode(next);
    setError(null);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedFarmer(null);
    setFields(EMPTY_FIELDS);
    setStep("identify");
  }

  // ── S2 section ───────────────────────────────────────────────────────────────
  if (step === "s2") {
    const farmerLabel = selectedFarmer
      ? `${selectedFarmer.name} ${selectedFarmer.lastName}`
      : null;

    return (
      <div className="space-y-6">
        {farmerLabel && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Encuestado: <span className="font-semibold">{farmerLabel}</span>
            {selectedFarmer?.farm?.name && (
              <> — Finca: <span className="font-semibold">{selectedFarmer.farm.name}</span></>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Cultivos que produce <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            {crops.map((crop) => {
              const checked = selectedCropIds.includes(crop.cropId);
              return (
                <label
                  key={crop.cropId}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                    checked
                      ? "border-green-600 bg-green-50 text-green-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-green-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-green-600"
                    checked={checked}
                    onChange={() => toggleCrop(crop.cropId)}
                  />
                  <span className="text-sm font-medium">{crop.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleStart}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
        >
          Iniciar campaña
        </button>

        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Continuar sin identificar encuestado
          </button>
        </div>
      </div>
    );
  }

  // ── Identify section ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        {(["search", "create"] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {m === "search" ? "Buscar encuestado" : "Nuevo encuestado"}
          </button>
        ))}
      </div>

      {/* Search mode */}
      {mode === "search" && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-green-600 transition-colors"
            />
            {searching && (
              <span className="absolute right-3 top-3 text-xs text-gray-400">
                Buscando…
              </span>
            )}
          </div>

          {searchResults.length > 0 && (
            <ul className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {searchResults.map((farmer) => (
                <li key={farmer.id}>
                  <button
                    onClick={() => handleSelectFarmer(farmer)}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {farmer.name} {farmer.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Doc: {farmer.documentId}
                      {farmer.farm?.name && ` · Finca: ${farmer.farm.name}`}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {searchQuery.trim() && !searching && searchResults.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              Sin resultados. Puedes crear un nuevo encuestado.
            </p>
          )}
        </div>
      )}

      {/* Create mode */}
      {mode === "create" && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Identificación
          </p>

          {[
            { name: "name", label: "Nombre", required: true },
            { name: "lastName", label: "Apellido", required: true },
            { name: "documentId", label: "Número de documento", required: true },
            { name: "phone", label: "Teléfono", required: false },
            { name: "email", label: "Correo electrónico", required: false },
          ].map(({ name, label, required }) => (
            <div key={name}>
              <label className="block text-xs text-gray-500 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={name === "email" ? "email" : "text"}
                name={name}
                value={fields[name as keyof typeof fields]}
                onChange={handleFieldChange}
                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-900 focus:outline-none focus:border-green-600 transition-colors"
              />
            </div>
          ))}

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-2">
            Unidad productiva (opcional)
          </p>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre de la finca</label>
            <input
              type="text"
              name="farmName"
              value={fields.farmName}
              onChange={handleFieldChange}
              className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-900 focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Departamento</label>
            <select
              name="departmentId"
              value={fields.departmentId}
              onChange={handleFieldChange}
              className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-900 focus:outline-none focus:border-green-600 transition-colors"
            >
              <option value="">— Seleccionar —</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Municipio</label>
            <select
              name="townId"
              value={fields.townId}
              onChange={handleFieldChange}
              disabled={!fields.departmentId}
              className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-900 focus:outline-none focus:border-green-600 transition-colors disabled:opacity-40"
            >
              <option value="">— Seleccionar —</option>
              {towns.map((t) => (
                <option key={t.townId} value={t.townId}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Vereda</label>
            <input
              type="text"
              name="vereda"
              value={fields.vereda}
              onChange={handleFieldChange}
              className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-900 focus:outline-none focus:border-green-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "latitude", label: "Latitud" },
              { name: "longitude", label: "Longitud" },
              { name: "altitude", label: "Altitud (m)" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type="number"
                  name={name}
                  value={fields[name as keyof typeof fields]}
                  onChange={handleFieldChange}
                  className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-900 focus:outline-none focus:border-green-600 transition-colors"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleCreateFarmer}
            disabled={loading}
            className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Confirmar y continuar"}
          </button>
        </div>
      )}

      {error && mode === "search" && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="text-center pt-1">
        <button
          onClick={onSkip}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Continuar sin identificar encuestado
        </button>
      </div>
    </div>
  );
}
