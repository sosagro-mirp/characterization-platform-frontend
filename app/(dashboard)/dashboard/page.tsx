import { Suspense } from "react";
import type { Metadata } from "next";
import { listActiveCampaigns } from "@/services/campaigns.service";
import {
  fetchCategories,
  fetchDashboardAnalytics,
  fetchDashboardOverview,
  fetchDepartmentCounts,
  fetchKpis,
  fetchPublicActorTypes,
  fetchPublicCrops,
  fetchPublicDepartments,
} from "../api";
import { parseDashboardParams } from "@/lib/dashboard/filters";
import { DashboardFilters, DashboardQuestion } from "../types";
import DashboardSidebar from "../components/DashboardSidebar";
import GlobalFilterBar from "../components/GlobalFilterBar";
import KpiStrip from "../components/KpiStrip";
import ViewHeader from "../components/ViewHeader";
import OverviewView from "../components/OverviewView";
import QuestionsGrid from "../components/QuestionsGrid";
import SuppressedDataCard from "../components/SuppressedDataCard";
import EmptyStateCard from "../components/EmptyStateCard";
import DashboardSkeleton from "../components/DashboardSkeleton";
import ColombiaMap from "../components/ColombiaMap";
import LikertBatteryChart from "../components/aggregate/LikertBatteryChart";
import YesNoBatteryChart from "../components/aggregate/YesNoBatteryChart";
import FocalizationChart from "../components/aggregate/FocalizationChart";
import RespondentProfile from "../components/aggregate/RespondentProfile";

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
 * Fase 6 (spec 43): resuelve la vista raíz. Sin `categoryId`/`instrumentId`
 * (D2: `instrumentId` es un drill-down avanzado que `GlobalFilterBar` ya no
 * expone como control, pero D6 lo mantiene disponible) → `OverviewView`
 * curada (layout `1a`). Con selección → el grid de preguntas del spec 30
 * como contenido interino; `CategoryView`/`DigitalDemandView` llegan en la
 * Fase 7.
 */
async function DashboardViewContent({
  state,
}: {
  state: ReturnType<typeof parseDashboardParams>;
}) {
  const { filters, categoryId } = state;
  const hasSelection = Boolean(categoryId || filters.instrumentId);

  if (!hasSelection) {
    return <OverviewView filters={filters} />;
  }

  const analyticsFilters: DashboardFilters = { ...filters, categoryId };

  // Fase 6 (spec 43): el mapa se muestra siempre (ver nota en `OverviewView`
  // sobre por qué `departmentId` activo no cambia la distribución nacional).
  const [data, departmentCounts, kpis] = await Promise.all([
    fetchDashboardAnalytics(analyticsFilters),
    fetchDepartmentCounts(analyticsFilters),
    fetchKpis(analyticsFilters),
  ]);

  return (
    <div className="space-y-4">
      <ViewHeader
        title={data.metadata.categoryName ?? data.metadata.instrumentName ?? "Categoría"}
        badge={categoryId}
        metadata={data.metadata}
      />

      <KpiStrip kpis={kpis} />

      <div className="max-w-md">
        <ColombiaMap data={departmentCounts} />
      </div>

      {data.suppressed ? (
        // D. de privacidad: 0 encuestas es "sin datos sincronizados" (EmptyStateCard);
        // 1-4 es "hay datos pero por debajo del umbral de anonimización" (SuppressedDataCard).
        data.metadata.totalCount === 0 ? (
          <EmptyStateCard />
        ) : (
          <SuppressedDataCard reason={data.reason} />
        )
      ) : (
        <>
          <QuestionsGrid questions={data.questions} hasInstrument />
          <AggregateAnalysis questions={data.questions} filters={analyticsFilters} />
        </>
      )}
    </div>
  );
}

function groupYesNoBySection(
  questions: DashboardQuestion[],
): [string, DashboardQuestion[]][] {
  const bySection = new Map<string, DashboardQuestion[]>();
  for (const q of questions) {
    if (q.questionType !== "yes_no" || q.suppressed) continue;
    const list = bySection.get(q.sectionName) ?? [];
    list.push(q);
    bySection.set(q.sectionName, list);
  }
  return [...bySection.entries()].filter(([, list]) => list.length >= 2);
}

/**
 * Fase 12 (spec 30): visualizaciones agregadas que explotan la estructura de
 * los datos (batería likert, "% Sí" por sección, focalización, perfil
 * demográfico) — valor incremental sobre el grid de preguntas individuales.
 */
function AggregateAnalysis({
  questions,
  filters,
}: {
  questions: DashboardQuestion[];
  filters: DashboardFilters;
}) {
  const yesNoBatteries = groupYesNoBySection(questions);

  return (
    <div className="mt-10 space-y-8">
      <h2 className="text-lg font-semibold text-text-primary">
        Análisis agregado
      </h2>

      <LikertBatteryChart questions={questions} />

      {yesNoBatteries.map(([sectionName, sectionQuestions]) => (
        <div key={sectionName}>
          <p className="text-sm font-medium text-text-primary mb-2">
            {sectionName} — % de respuestas &quot;Sí&quot;
          </p>
          <YesNoBatteryChart questions={sectionQuestions} />
        </div>
      ))}

      <FocalizationChart questions={questions} />

      <Suspense fallback={null}>
        <RespondentProfileData filters={filters} />
      </Suspense>
    </div>
  );
}

async function RespondentProfileData({ filters }: { filters: DashboardFilters }) {
  const overview = await fetchDashboardOverview(filters);
  return <RespondentProfile overview={overview} />;
}
