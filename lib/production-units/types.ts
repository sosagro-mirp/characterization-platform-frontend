// Spec 98 — contrato de `GET /api/production-units`.

export type ScopeLevel = "farmer" | "farm" | "farm_crop";
export type CoverageStatus = "aplicado" | "parcial" | "falta" | "no_aplica";

export interface CoverageCell {
  status: CoverageStatus;
  surveyId?: string | null;
  surveyCount?: number;
  coveredFarmers?: number;
  totalFarmers?: number;
  outOfScope?: boolean;
  inferredFarm?: boolean;
  inferredCrop?: boolean;
  noRegisteredCrop?: boolean;
}

export interface CoverageColumn {
  instrumentId: string;
  name: string;
  code: string | null;
  scopeLevel: ScopeLevel;
  cropIds: string[];
  coverageGroup: string | null;
  memberIds: string[];
}

export interface UnitFarmer {
  farmerId: string;
  name: string;
  documentId: string | null;
  phone: string | null;
  role: string | null;
  isPrimary: boolean;
}

export interface UnitRow {
  farmId: string;
  name: string;
  department: { departmentId: string; name: string } | null;
  town: { townId: string; name: string } | null;
  crops: { farmCropId?: string; cropId: string; name: string }[];
  farmers?: UnitFarmer[];
  totalSurveys?: number;
  unsyncedWithResponses?: number;
  coverage: Record<string, CoverageCell>;
  warnings?: string[];
}

export interface UnlocatedSurvey {
  surveyId: string;
  origin: string;
  createdAt: string;
  farmerId: string | null;
  respondentName: string | null;
  responseCount: number;
  instrumentIds: string[];
  reason: "sin_productor" | "productor_sin_finca" | "productor_varias_fincas";
}

export interface ProductionUnitsResponse {
  instruments: CoverageColumn[];
  rows: UnitRow[];
  summary: {
    farms: number;
    instrumentsWithoutScope: number;
    unlocated: number;
    totalSurveys: number;
  };
  unlocated: UnlocatedSurvey[];
}

export interface UnitFilters {
  departmentIds?: string[];
  townIds?: string[];
  cropIds?: string[];
  instrument?: { instrumentId: string; statuses: CoverageStatus[] } | null;
  /** Texto por columna: `name`, `department`, `town`, `crops`, `farmers`. */
  columns?: Record<string, string>;
}
