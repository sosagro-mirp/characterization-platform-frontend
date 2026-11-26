// Spec 98 — contrato de `GET /api/production-units`.

export type ScopeLevel = "farmer" | "farm" | "farm_crop";
export type CoverageStatus = "aplicado" | "parcial" | "falta" | "no_aplica";

/** Spec 112 — cultivo aplicable de la finca y si quedó cubierto. */
export interface CropUnit {
  farmCropId: string;
  cropId: string;
  covered: boolean;
}

export interface CoverageCell {
  status: CoverageStatus;
  /** Spec 112 — encuestas posibles y realizadas (0 de 0 si no aplica). */
  possible?: number;
  done?: number;
  /** Spec 112 — solo en `farm_crop`. */
  cropUnits?: CropUnit[];
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
  consentPending?: boolean;
}

export type SelectionStatus = "included" | "excluded" | "in_review";

/** Decisión vigente (spec 99); `null` en la fila = sin decisión. */
export interface UnitSelection {
  status: SelectionStatus;
  reason: string;
  version: number;
  updatedAt: string;
}

export interface UnitRow {
  farmId: string;
  name: string;
  department: { departmentId: string; name: string } | null;
  town: { townId: string; name: string } | null;
  crops: { farmCropId?: string; cropId: string; name: string }[];
  farmers?: UnitFarmer[];
  hasPendingConsent?: boolean;
  totalSurveys?: number;
  unsyncedWithResponses?: number;
  coverage: Record<string, CoverageCell>;
  warnings?: string[];
  selection?: UnitSelection | null;
}

export interface UnlocatedSurvey {
  surveyId: string;
  origin: string;
  createdAt: string;
  farmerId: string | null;
  respondentName: string | null;
  responseCount: number;
  instrumentIds: string[];
  reason:
    | "sin_productor"
    | "productor_sin_finca"
    | "productor_varias_fincas"
    | "cultivo_ambiguo";
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
  /** Decisiones a mostrar; `none` = sin decisión. Vacío = todas. */
  selection?: (SelectionStatus | "none")[];
}
