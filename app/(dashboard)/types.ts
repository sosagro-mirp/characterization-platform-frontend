/** `gender`..`chainStage` (spec 43, D3) coinciden por texto exacto de opción
 * contra la pregunta fuente que resuelve el backend; `ageRange` es uno de los
 * 4 buckets fijos (`<30`, `30-45`, `46-60`, `>60`). `categoryId` viaja aquí
 * solo para llamadas a la API (spread junto al resto de filtros); a nivel de
 * página vive por separado en `DashboardPageState.categoryId`
 * (`lib/dashboard/filters.ts`, D6) — no lo agregues a `FILTER_KEYS` ahí. */
export interface DashboardFilters {
  instrumentId?: string;
  categoryId?: string;
  departmentId?: string;
  townId?: string;
  cropId?: string;
  actorTypeId?: string;
  gender?: string;
  ageRange?: string;
  educationLevel?: string;
  connectivity?: string;
  populationGroup?: string;
  profile?: string;
  tenure?: string;
  chainStage?: string;
  campaignId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InstrumentSummary {
  instrumentId: string;
  name: string;
  code: string | null;
}

export interface DashboardMetadata {
  totalCount: number;
  instrumentName?: string;
  categoryName?: string;
  departmentName?: string;
  townName?: string;
  cropName?: string;
  actorTypeName?: string;
  dateRange?: { from: string; to: string } | null;
  filters: DashboardFilters;
}

/** Catálogo de categorías temáticas C1–C15 (spec 43, Fase 1). */
export interface DashboardCategory {
  id: string;
  code: string;
  name: string;
  instrumentCount: number;
  questionCount: number;
}

/** Tira de KPIs curados (spec 43, D5). `value` null cuando `suppressed`. */
export interface DashboardKpi {
  key: string;
  label: string;
  value: number | null;
  optionText?: string | null;
  unit?: string;
  suppressed: boolean;
}

export interface AggregationOption {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
  value: number | null;
}

export interface AggregationYesNo {
  type: "yes_no";
  yesCount: number;
  noCount: number;
  yesPercentage: number;
  noPercentage: number;
}

export interface AggregationChoices {
  type: "single_choice" | "multiple_choice" | "compliance";
  options: AggregationOption[];
}

export interface AggregationLikert {
  type: "likert";
  options: AggregationOption[];
  meanScore: number | null;
  isInverted: boolean;
}

export interface AggregationNumeric {
  type: "numeric";
  count: number;
  average: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  q1: number | null;
  q3: number | null;
  distribution?: number[];
}

export type DashboardAggregation =
  | AggregationYesNo
  | AggregationChoices
  | AggregationLikert
  | AggregationNumeric;

export interface DashboardQuestion {
  questionId: string;
  questionText: string;
  questionType: string;
  sectionName: string;
  /** Procedencia por pregunta (spec 43, D9) — necesaria en vistas de
   * categoría, que agregan varios instrumentos en un solo grid. */
  instrumentId?: string;
  instrumentName?: string;
  systemField: string | null;
  isInverted: boolean;
  answeredCount: number;
  suppressed: boolean;
  aggregation: DashboardAggregation | null;
}

export interface DashboardResponse {
  metadata: DashboardMetadata;
  suppressed: boolean;
  reason?: string;
  questions: DashboardQuestion[];
}

export interface DashboardSummary {
  count: number;
  suppressed: boolean;
}

export interface DashboardDepartmentCount {
  departmentId: string;
  departmentName: string;
  count: number;
}

export interface DashboardOverviewBucket {
  id: string;
  name: string;
  count: number;
}

export interface DashboardOverview {
  totalCount: number;
  suppressed: boolean;
  byActorType: DashboardOverviewBucket[];
  byCrop: DashboardOverviewBucket[];
  byDepartment: DashboardOverviewBucket[];
  age: AggregationNumeric | null;
  experienceYears: AggregationNumeric | null;
}

/** D4: consolidación "Demanda digital" (C15). Consumida por la Fase 7
 * (`DigitalDemandView`); el tipo se define ya en la Fase 5 junto al fetch. */
export interface LikertRankingItem {
  questionId: string;
  questionText: string;
  sectionName: string;
  meanScore: number;
  bands: AggregationOption[];
  answeredCount: number;
}

export interface IndexByCutBucket {
  label: string;
  meanScore: number | null;
  suppressed: boolean;
}

export interface BarriersRadar {
  b1: number | null;
  b2: number | null;
  b3: number | null;
}

export interface InstitutionTrustItem {
  questionId: string;
  label: string;
  meanScore: number | null;
  bands: AggregationOption[];
  suppressed: boolean;
}

export interface DashboardDigitalDemand {
  suppressed: boolean;
  reason?: string;
  acceptanceIndex: number | null;
  likertRanking: LikertRankingItem[];
  indexByCut: {
    age: IndexByCutBucket[];
    education: IndexByCutBucket[];
    connectivity: IndexByCutBucket[];
  };
  barriersRadar: BarriersRadar;
  adoptionBarriers: AggregationOption[];
  institutionTrust: InstitutionTrustItem[];
  digitalSkills: AggregationOption[];
  platforms: AggregationOption[];
  preferredChannel: AggregationOption[];
}
