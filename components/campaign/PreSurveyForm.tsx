"use client";

import { useEffect, useRef, useState } from "react";
import { LastFarmerResult, FarmerSearchResult } from "@/app/(instrument)/types";
import { searchFarmers } from "@/services/farmers.service";
import { getLastFarmer } from "@/services/campaign-sessions.service";
import { useCampaignSessionStore } from "@/store/useCampaignSessionStore";

interface PreSurveyFormProps {
  onSearchSelect: (farmerId: string) => void;
  onNewFarmer: () => void;
  onContinueLast: (farmerId: string) => void;
  onSkip: () => void;
}

export default function PreSurveyForm({
  onSearchSelect,
  onNewFarmer,
  onContinueLast,
  onSkip,
}: PreSurveyFormProps) {
  const { farmerId: storedFarmerId, farmerName: storedFarmerName } =
    useCampaignSessionStore();

  const [lastFarmer, setLastFarmer] = useState<LastFarmerResult>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FarmerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (storedFarmerId && storedFarmerName) {
      setLastFarmer({ farmerId: storedFarmerId, name: storedFarmerName, lastName: null });
      return;
    }
    getLastFarmer()
      .then(setLastFarmer)
      .catch(() => {});
  }, [storedFarmerId, storedFarmerName]);

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

  const farmerLabel = lastFarmer
    ? [lastFarmer.name, lastFarmer.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Buscar encuestado</p>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o documento…"
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
                  onClick={() => onSearchSelect(farmer.id)}
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
            Sin resultados.
          </p>
        )}
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400">o</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* New farmer */}
      <button
        onClick={onNewFarmer}
        className="w-full rounded-xl border border-green-600 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
      >
        Nuevo encuestado
      </button>

      {/* Continue with last farmer */}
      {lastFarmer && (
        <button
          onClick={() => onContinueLast(lastFarmer.farmerId)}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
        >
          Continuar con {farmerLabel}
          {lastFarmer.farm?.name && (
            <span className="ml-1 font-normal opacity-80">
              · {lastFarmer.farm.name}
            </span>
          )}
        </button>
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
