import { Suspense } from "react";
import type { Metadata } from "next";
import { listActiveCampaigns } from "@/services/campaigns.service";
import {
  fetchCategories,
  fetchPublicActorTypes,
  fetchPublicCrops,
  fetchPublicDepartments,
} from "../api";
import { parseDashboardParams } from "@/lib/dashboard/filters";
import { DashboardFilters } from "../types";
import DashboardSidebar from "../components/DashboardSidebar";
import GlobalFilterBar from "../components/GlobalFilterBar";
import DashboardSkeleton from "../components/DashboardSkeleton";
import OverviewView from "../components/OverviewView";
import CategoryView from "../components/CategoryView";
import DigitalDemandView from "../components/DigitalDemandView";

export const metadata: Metadata = {
  title: "Explorar datos",
};

/** Superconjunto de `DashboardFilters` + `view`/`categoryId` (D6) — Next no
 * valida esta forma en tiempo de ejecución, es solo el contrato asumido.
 * El índice satisface a `parseDashboardParams` (acepta cualquier clave). */
interface DashboardSearchParams extends DashboardFilters {
  view?: string;
  [key: string]: string | undefined;
}

interface DashboardPageProps {
  searchParams: Promise<DashboardSearchParams>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const state = parseDashboardParams(await searchParams);

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      <DashboardSidebar
        categories={await fetchCategories()}
        state={state}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Suspense fallback={<div className="h-[52px] bg-surface border-b border-[var(--border)]" />}>
          <GlobalFilterBarData state={state} />
        </Suspense>

        <div className="flex-1 p-4 sm:p-6 space-y-4">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardViewContent state={state} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function GlobalFilterBarData({
  state,
}: {
  state: ReturnType<typeof parseDashboardParams>;
}) {
  const [departments, crops, actorTypes, campaigns] = await Promise.all([
    fetchPublicDepartments(),
    fetchPublicCrops(),
    fetchPublicActorTypes(),
    listActiveCampaigns(),
  ]);

  return (
    <GlobalFilterBar
      state={state}
      departments={departments}
      crops={crops}
      actorTypes={actorTypes}
      campaigns={campaigns}
    />
  );
}

/**
 * Fase 7 (spec 43): enruta a la vista curada correspondiente. Sin
 * `categoryId`/`instrumentId` → `OverviewView` (layout `1a`). Con
 * `categoryId=C15` → `DigitalDemandView` (D4, caso especial). Cualquier
 * otra categoría, o el drill-down avanzado por `instrumentId` (D2, sin
 * control propio en `GlobalFilterBar` pero disponible por URL) →
 * `CategoryView` genérica.
 */
async function DashboardViewContent({
  state,
}: {
  state: ReturnType<typeof parseDashboardParams>;
}) {
  const { filters, categoryId } = state;

  if (!categoryId && !filters.instrumentId) {
    return <OverviewView filters={filters} />;
  }

  if (categoryId === "C15") {
    return <DigitalDemandView filters={filters} />;
  }

  const analyticsFilters: DashboardFilters = categoryId
    ? { ...filters, categoryId }
    : filters;

  return <CategoryView filters={analyticsFilters} badge={categoryId} />;
}
