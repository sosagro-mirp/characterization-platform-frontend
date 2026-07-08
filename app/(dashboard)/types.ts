export interface DashboardFilters {
  instrumentId?: string;
  departmentId?: string;
  townId?: string;
  cropId?: string;
  actorTypeId?: string;
}

export interface InstrumentSummary {
  instrumentId: string;
  name: string;
  code: string | null;
}

export interface DashboardMetadata {
  totalCount: number;
  instrumentName?: string;
  departmentName?: string;
  townName?: string;
  cropName?: string;
  actorTypeName?: string;
  dateRange?: { from: string; to: string } | null;
  filters: DashboardFilters;
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
