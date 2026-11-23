import { Suspense } from "react";
import type { Metadata } from "next";
import {
  fetchServedCategories,
  fetchPublicActorTypes,
  fetchPublicCrops,
  fetchPublicDepartments,
} from "../api";
import { parseDashboardParams } from "@/lib/dashboard/filters";
import { DashboardFilters, ServedCategory } from "../types";
import DashboardSidebar from "../components/DashboardSidebar";
import GlobalFilterBar from "../components/GlobalFilterBar";
import DashboardSkeleton from "../components/DashboardSkeleton";
import OverviewView from "../components/OverviewView";
import CategoryView from "../components/CategoryView";
import DigitalDemandView from "../components/DigitalDemandView";
import DashboardUnavailableNotice from "../components/DashboardUnavailableNotice";
import DashboardUnderConstruction from "../components/DashboardUnderConstruction";

export const metadata: Metadata = {
  title: "Explorar datos",
};

/**
 * Mientras sea `true`, la página muestra solo el aviso de «en construcción» y
 * no consulta la API. Encendido (`false`) en el spec 109, Fase 6 (2026-11-23),
 * tras la revisión de punta a punta del constructor (TC-109-027).
 */
const DASHBOARD_UNDER_CONSTRUCTION = false;

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
  if (DASHBOARD_UNDER_CONSTRUCTION) {
    return <DashboardUnderConstruction />;
  }

  // Spec 109 (P2, P20): la navegación sale de la API — solo categorías
  // activas con gráficos públicos publicados; un código no declarado vuelve
  // al resumen general.
  const categories = await fetchServedCategories();
  const state = parseDashboardParams(
    await searchParams,
    categories.map((c) => c.code),
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      <DashboardSidebar categories={categories} state={state} />

      {/* El sidebar es `lg:fixed` (no se mueve con el scroll, igual que el
          navbar) — este `lg:pl-80` compensa su ancho (`lg:w-80`) ya que al
          quedar fuera del flujo deja de empujar el contenido por sí solo. */}
      <div className="flex-1 min-w-0 flex flex-col lg:pl-80">
        <Suspense fallback={<div className="h-[68px] bg-surface border-b border-[var(--border)]" />}>
          <GlobalFilterBarData state={state} categories={categories} />
        </Suspense>

        <div className="flex-1 p-4 sm:p-6 space-y-4">
          <DashboardUnavailableNotice />
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardViewContent state={state} categories={categories} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function GlobalFilterBarData({
  state,
  categories,
}: {
  state: ReturnType<typeof parseDashboardParams>;
  categories: ServedCategory[];
}) {
  const [departments, crops, actorTypes] = await Promise.all([
    fetchPublicDepartments(),
    fetchPublicCrops(),
    fetchPublicActorTypes(),
  ]);

  const categoryTitle = state.categoryId
    ? (categories.find((c) => c.code === state.categoryId)?.name ?? "Categoría")
    : "Resumen general";

  return (
    <GlobalFilterBar
      state={state}
      categoryTitle={categoryTitle}
      departments={departments}
      crops={crops}
      actorTypes={actorTypes}
    />
  );
}

/**
 * Spec 109: sin categoría → `OverviewView` (bloques fijos + gráficos de
 * `OVERVIEW`); `C14` → `DigitalDemandView` (bloque consolidado fijo + sus
 * gráficos configurados); cualquier otra → `CategoryView` con los gráficos
 * publicados de la categoría. La categoría ya viene validada contra la API.
 */
async function DashboardViewContent({
  state,
}: {
  state: ReturnType<typeof parseDashboardParams>;
  categories: ServedCategory[];
}) {
  const { filters, categoryId } = state;

  if (!categoryId) {
    return <OverviewView filters={filters} />;
  }

  if (categoryId === "C14") {
    return <DigitalDemandView filters={filters} />;
  }

  return <CategoryView categoryCode={categoryId} filters={filters} />;
}
