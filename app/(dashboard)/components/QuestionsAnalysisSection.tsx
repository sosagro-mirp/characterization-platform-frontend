import { Suspense } from "react";
import { fetchDashboardOverview } from "../api";
import { DashboardFilters, DashboardResponse, DashboardQuestion } from "../types";
import QuestionsGrid from "./QuestionsGrid";
import SuppressedDataCard from "./SuppressedDataCard";
import EmptyStateCard from "./EmptyStateCard";
import LikertBatteryChart from "./aggregate/LikertBatteryChart";
import YesNoBatteryChart from "./aggregate/YesNoBatteryChart";
import FocalizationChart from "./aggregate/FocalizationChart";
import RespondentProfile from "./aggregate/RespondentProfile";

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

interface QuestionsAnalysisSectionProps {
  data: DashboardResponse;
  filters: DashboardFilters;
}

/**
 * Grid de preguntas + análisis agregado (spec 30, Fase 7/12), extraído de
 * `page.tsx` en la Fase 7 (spec 43) para que `CategoryView` y
 * `DigitalDemandView` lo reutilicen sin duplicar la lógica de supresión.
 */
export default function QuestionsAnalysisSection({
  data,
  filters,
}: QuestionsAnalysisSectionProps) {
  if (data.suppressed) {
    // D. de privacidad: 0 encuestas es "sin datos sincronizados" (EmptyStateCard);
    // 1-4 es "hay datos pero por debajo del umbral de anonimización" (SuppressedDataCard).
    return data.metadata.totalCount === 0 ? (
      <EmptyStateCard />
    ) : (
      <SuppressedDataCard reason={data.reason} />
    );
  }

  const yesNoBatteries = groupYesNoBySection(data.questions);

  return (
    <>
      <QuestionsGrid questions={data.questions} hasInstrument />

      <div className="mt-10 space-y-8">
        <h2 className="text-lg font-semibold text-text-primary">
          Análisis agregado
        </h2>

        <LikertBatteryChart questions={data.questions} />

        {yesNoBatteries.map(([sectionName, sectionQuestions]) => (
          <div key={sectionName}>
            <p className="text-sm font-medium text-text-primary mb-2">
              {sectionName} — % de respuestas &quot;Sí&quot;
            </p>
            <YesNoBatteryChart questions={sectionQuestions} />
          </div>
        ))}

        <FocalizationChart questions={data.questions} />

        <Suspense fallback={null}>
          <RespondentProfileData filters={filters} />
        </Suspense>
      </div>
    </>
  );
}

async function RespondentProfileData({ filters }: { filters: DashboardFilters }) {
  const overview = await fetchDashboardOverview(filters);
  return <RespondentProfile overview={overview} />;
}
