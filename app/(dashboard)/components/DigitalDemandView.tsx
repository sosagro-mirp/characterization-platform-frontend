import { fetchDashboardAnalytics, fetchDigitalDemand } from "../api";
import { DashboardFilters, IndexByCutBucket } from "../types";
import ViewHeader from "./ViewHeader";
import KpiStrip from "./KpiStrip";
import LikertDivergingMatrix from "./LikertDivergingMatrix";
import IndexBars from "./IndexBars";
import RadarBarriers from "./RadarBarriers";
import OptionBars from "./OptionBars";
import QuestionsAnalysisSection from "./QuestionsAnalysisSection";

interface DigitalDemandViewProps {
  filters: DashboardFilters;
}

const CARD_CLASS = "rounded-lg border border-[var(--border)] bg-surface p-4";

/** `IndexByCutBucket` (`meanScore`, forma de la API) → `IndexBarItem`
 * (`value`, forma que espera el primitivo `IndexBars`). */
function toIndexBarItems(
  buckets: IndexByCutBucket[],
): { label: string; value: number | null; suppressed: boolean }[] {
  return buckets.map((bucket) => ({
    label: bucket.label,
    value: bucket.meanScore,
    suppressed: bucket.suppressed,
  }));
}

function cardHeader(title: string, source: string) {
  return (
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <span className="text-[10px] text-[var(--border-strong)]">{source}</span>
    </div>
  );
}

/**
 * Vista consolidada "Demanda digital" — caso especial de C15 (spec 43, D4,
 * Fase 7). Fila curada (`/digital-demand`, Fase 4) + el mismo grid de
 * preguntas genérico que `CategoryView` (`/analytics?categoryId=C15`) al
 * final: "modo de interacción preferido" y "disposición a pagar" del
 * mockup no tienen campo propio en el DTO de `/digital-demand` (decisión
 * documentada en la Fase 4 — el primero no estaba en el contrato original
 * de 9 campos, el segundo ya vive como KPI) y aparecen ahí como tarjetas
 * individuales, en vez de duplicar su fuente con una llamada dirigida más.
 */
export default async function DigitalDemandView({
  filters,
}: DigitalDemandViewProps) {
  const analyticsFilters: DashboardFilters = { ...filters, categoryId: "C15" };

  const [digitalDemand, data] = await Promise.all([
    fetchDigitalDemand(filters),
    fetchDashboardAnalytics(analyticsFilters),
  ]);

  const likertBatteryItems = digitalDemand.likertRanking.map((item) => ({
    questionId: item.questionId,
    label: item.questionText,
    distribution: item.bands.map((band) => band.count),
    meanScore: item.meanScore,
  }));

  const institutionTrustItems = digitalDemand.institutionTrust.map((item) => ({
    questionId: item.questionId,
    label: item.label,
    distribution: item.bands.map((band) => band.count),
    meanScore: item.meanScore,
  }));

  return (
    <div className="space-y-4">
      <ViewHeader metadata={data.metadata} />

      <KpiStrip />

      {digitalDemand.suppressed ? (
        <div className="rounded-lg border border-[var(--border)] bg-surface-muted px-4 py-6 text-center text-text-muted">
          {digitalDemand.reason ?? "Muestra insuficiente para la consolidación."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <div className={CARD_CLASS}>
              {cardHeader(
                "Interés en funcionalidades de la app ★",
                "Batería Likert ★ consolidada",
              )}
              <LikertDivergingMatrix items={likertBatteryItems} />
            </div>
            <div className={CARD_CLASS}>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">
                Índice de aceptación por corte
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-semibold text-[var(--border-strong)] uppercase mb-1.5">
                    Por rango de edad
                  </p>
                  <IndexBars items={toIndexBarItems(digitalDemand.indexByCut.age)} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-[var(--border-strong)] uppercase mb-1.5">
                    Por nivel educativo
                  </p>
                  <IndexBars items={toIndexBarItems(digitalDemand.indexByCut.education)} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-[var(--border-strong)] uppercase mb-1.5">
                    Por conectividad
                  </p>
                  <IndexBars items={toIndexBarItems(digitalDemand.indexByCut.connectivity)} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={CARD_CLASS}>
              {cardHeader("Índice por barrera", "S_DCU · radar")}
              <RadarBarriers data={digitalDemand.barriersRadar} />
            </div>
            <div className={CARD_CLASS}>
              {cardHeader("Barreras de adopción", "S11·Otras·1 · BarrasH")}
              <OptionBars options={digitalDemand.adoptionBarriers} />
            </div>
            <div className={CARD_CLASS}>
              {cardHeader("Confianza en instituciones", "S_DCU·E.5")}
              <LikertDivergingMatrix items={institutionTrustItems} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={CARD_CLASS}>
              {cardHeader("Habilidades digitales", "S11·Hab·2")}
              <OptionBars options={digitalDemand.digitalSkills} />
            </div>
            <div className={CARD_CLASS}>
              {cardHeader("Plataformas que usa", "S11·Hab·6")}
              <OptionBars options={digitalDemand.platforms} />
            </div>
            <div className={CARD_CLASS}>
              {cardHeader("Canal preferido de información", "S11-RES")}
              <OptionBars options={digitalDemand.preferredChannel} />
            </div>
          </div>
        </>
      )}

      <QuestionsAnalysisSection data={data} filters={analyticsFilters} />
    </div>
  );
}
