import { Suspense } from "react";
import type { Metadata } from "next";
import {
  fetchDashboardAnalytics,
  fetchDashboardOverview,
  fetchDepartmentCounts,
  fetchPublicActorTypes,
  fetchPublicCrops,
  fetchPublicDepartments,
  fetchPublicInstruments,
} from "../api";
import { DashboardFilters, DashboardQuestion } from "../types";
import FilterPanel from "../components/FilterPanel";
import FilterPanelLoading from "../components/FilterPanel.loading";
import MetadataBar from "../components/MetadataBar";
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

interface DashboardPageProps {
  searchParams: Promise<{
    instrumentId?: string;
    departmentId?: string;
    townId?: string;
    cropId?: string;
    actorTypeId?: string;
  }>;
}

function parseFilters(
  raw: Awaited<DashboardPageProps["searchParams"]>,
): DashboardFilters {
  return {
    instrumentId: raw.instrumentId || undefined,
    departmentId: raw.departmentId || undefined,
    townId: raw.townId || undefined,
    cropId: raw.cropId || undefined,
    actorTypeId: raw.actorTypeId || undefined,
  };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const filters = parseFilters(await searchParams);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
      <Suspense fallback={<FilterPanelLoading />}>
        <FilterPanelData />
      </Suspense>
      <div className="flex-1 min-w-0">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}

async function FilterPanelData() {
  const [instruments, departments, crops, actorTypes] = await Promise.all([
    fetchPublicInstruments(),
    fetchPublicDepartments(),
    fetchPublicCrops(),
    fetchPublicActorTypes(),
  ]);

  return (
    <FilterPanel
      instruments={instruments}
      departments={departments}
      crops={crops}
      actorTypes={actorTypes}
    />
  );
}

async function DashboardContent({ filters }: { filters: DashboardFilters }) {
  if (!filters.instrumentId) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">
          Dashboard público de encuestas
        </h1>
        <QuestionsGrid questions={[]} hasInstrument={false} />
      </div>
    );
  }

  // Fase 9: el mapa solo tiene sentido sin un departamento ya seleccionado
  // (si no, sería un mapa de un solo departamento resaltado).
  const [data, departmentCounts] = await Promise.all([
    fetchDashboardAnalytics(filters),
    filters.departmentId ? Promise.resolve(null) : fetchDepartmentCounts(filters),
  ]);

  return (
    <div>
      <MetadataBar metadata={data.metadata} />

      {departmentCounts && (
        <div className="mb-6 max-w-md">
          <ColombiaMap data={departmentCounts} />
        </div>
      )}

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
          <AggregateAnalysis questions={data.questions} filters={filters} />
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
 * Fase 12: visualizaciones agregadas que explotan la estructura de los datos
 * (batería likert, "% Sí" por sección, focalización, perfil demográfico) —
 * valor incremental sobre el grid de preguntas individuales de la Fase 7.
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
            {sectionName} — % de respuestas "Sí"
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
