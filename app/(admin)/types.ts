export interface UserAuditSummary {
  userId: string;
  name: string;
  lastName: string;
}

export interface ActorTypeSummary {
  actorTypeId: string;
  name: string;
  description: string | null;
}

export interface TypeOfQuestionSummary {
  typeId: string;
  name: string;
}

// ── Option ──────────────────────────────────────────────────────────────────

export interface OptionDetail {
  optionId: string;
  text: string;
  value: number | null;
  isOther: boolean;
  /** Spec 84 — solo viene poblado desde `getInstrumentForEditor` (editor-structure). */
  archivedAt?: string | null;
  /** Spec 84 — cuántas respuestas usan esta opción; solo desde editor-structure. */
  responseCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOptionRequest {
  text: string;
  value?: number;
  isOther?: boolean;
}

export interface UpdateOptionRequest {
  text?: string;
  value?: number | null;
  isOther?: boolean;
}

// ── Question ─────────────────────────────────────────────────────────────────

export interface QuestionDetail {
  questionId: string;
  text: string;
  isRequired: boolean;
  isSelectionCriteria: boolean;
  isKeyQuestion: boolean;
  order: number;
  type: TypeOfQuestionSummary;
  options: OptionDetail[];
  conditionQuestionId: string | null;
  conditionValue: string | null;
  /** Spec 84 — solo viene poblado desde `getInstrumentForEditor` (editor-structure). */
  archivedAt?: string | null;
  /** Spec 84 — cuántas respuestas tiene esta pregunta; solo desde editor-structure. */
  responseCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  text: string;
  typeId: string;
  isRequired: boolean;
  isSelectionCriteria?: boolean;
  isKeyQuestion?: boolean;
  order: number;
  conditionQuestionId?: string;
  conditionValue?: string;
}

export interface UpdateQuestionRequest {
  text?: string;
  typeId?: string;
  isRequired?: boolean;
  isSelectionCriteria?: boolean;
  isKeyQuestion?: boolean;
  order?: number;
  conditionQuestionId?: string | null;
  conditionValue?: string | null;
  /** Spec 84 — mueve la pregunta a otra sección del mismo instrumento. */
  targetSectionId?: string;
}

export interface CopyQuestionResponse {
  question: QuestionDetail;
  /** true si la pregunta de origen tenía condición de visibilidad; no viaja a la copia. */
  droppedCondition: boolean;
}

// ── Section ──────────────────────────────────────────────────────────────────

export interface SectionDetail {
  sectionId: string;
  name: string;
  order: number;
  questions: QuestionDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionSummary {
  sectionId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionRequest {
  name: string;
  order: number;
}

export interface UpdateSectionRequest {
  name?: string;
  order?: number;
}

// ── Instrument ───────────────────────────────────────────────────────────────

export interface InstrumentListItem {
  instrumentId: string;
  name: string;
  version: number;
  publishDate: string;
  isActive: boolean;
  /** Spec 79 — el instrumento se puede compartir por /encuesta/{instrumentId}. */
  isPublic: boolean;
  actorTypes: ActorTypeSummary[];
  createdBy?: UserAuditSummary | null;
  updatedBy?: UserAuditSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstrumentDetail extends InstrumentListItem {
  sections: SectionSummary[];
}

export interface CreateInstrumentRequest {
  name: string;
  version: number;
  publishDate: string;
  isActive: boolean;
  actorTypeIds?: string[];
}

export interface UpdateInstrumentRequest {
  name?: string;
  version?: number;
  publishDate?: string;
  isActive?: boolean;
  /** Spec 79 — se rechaza con 422 si el instrumento tiene preguntas multimedia. */
  isPublic?: boolean;
  actorTypeIds?: string[];
}

export interface DuplicateInstrumentRequest {
  name: string;
  version: number;
  publishDate?: string;
}

// ── Role / User ──────────────────────────────────────────────────────────────

export type RoleName = "admin" | "researcher" | "pollster";

export interface RoleSummary {
  roleId: string;
  name: RoleName;
}

export interface UserListItem {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  role: RoleSummary | null;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type UserDetail = UserListItem;

export interface CreateUserRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateUserRequest {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  roleId?: string;
}

// ── Campaign / CampaignStep ──────────────────────────────────────────────────

export interface InstrumentRef {
  instrumentId: string;
  name: string;
  isActive: boolean;
}

export interface QuestionRef {
  questionId: string;
  text: string;
}

export interface CropRef {
  cropId: string;
  name: string;
}

export type ConditionType = "question" | "crop";
export type LogicalOperator = "AND" | "OR";

export interface StepConditionDetail {
  conditionId: string;
  order: number;
  logicalOperator: LogicalOperator | null;
  conditionType: ConditionType;
  conditionQuestion: QuestionRef | null;
  conditionValue: string | null;
  conditionCrop: CropRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStepConditionRequest {
  order: number;
  logicalOperator?: LogicalOperator;
  conditionType: ConditionType;
  conditionQuestionId?: string;
  conditionValue?: string;
  conditionCropId?: string;
}

export interface UpdateStepConditionRequest {
  order?: number;
  logicalOperator?: LogicalOperator;
  conditionType?: ConditionType;
  conditionQuestionId?: string;
  conditionValue?: string;
  conditionCropId?: string;
}

export interface CampaignStepDetail {
  stepId: string;
  order: number;
  instrument: InstrumentRef;
  conditions: StepConditionDetail[];
}

export interface CampaignSummary {
  campaignId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdBy?: UserAuditSummary | null;
  updatedBy?: UserAuditSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDetail extends CampaignSummary {
  steps: CampaignStepDetail[];
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateCampaignStepRequest {
  instrumentId: string;
  order: number;
}

export interface UpdateCampaignStepRequest {
  instrumentId?: string;
  order?: number;
}

// ── Farmer / Farm (admin edit) ───────────────────────────────────────────────

export interface FarmSummaryForFarmer {
  farmId: string;
  name: string;
  vereda: string | null;
  altitude: number | null;
  crops: { cropId: string; name: string }[];
}

/** Spec 94 — catálogo de roles del productor en una finca (D-H3-3). */
export type FarmRole = "owner" | "producer" | "manager" | "worker" | "family" | "other";

/** Spec 94 — cultivo de finca (`FarmCrop`) con id propio. */
export interface FarmCropSummary {
  farmCropId: string;
  cropId: string;
  name: string;
}

/** Spec 94 — elemento de `farms[]` en `GET /farmers/:id`. */
export interface FarmerFarm {
  farmId: string;
  name: string;
  vereda: string | null;
  town: { townId: string; name: string } | null;
  role: FarmRole;
  isPrimary: boolean;
  crops: FarmCropSummary[];
}

/** Spec 94 — productor vinculado a una finca (`farmers[]` en `GET /farms/:id`). */
export interface FarmLinkedFarmer {
  farmerId: string;
  name: string;
  role: FarmRole;
  isPrimary: boolean;
}

/** Spec 94 — `GET /farms/:id`: la finca con sus productores y cultivos de finca. */
export interface FarmDetail extends FarmSummaryForFarmer {
  farmers: FarmLinkedFarmer[];
  farmCrops?: FarmCropSummary[];
}

export interface FarmerDetail {
  id: string;
  name: string;
  documentId: string | null;
  phone: string | null;
  email: string | null;
  /** La finca principal (alias deprecado hasta H8; ver `farms`). */
  farm: FarmSummaryForFarmer | null;
  /** Spec 94 — todas las fincas del productor, con rol y marca de principal. */
  farms?: FarmerFarm[];
  createdAt: string;
  /**
   * Spec 78, Fase 13 (cambio de alcance 2026-08-28) — true si el agricultor
   * no tiene consentimiento vigente de la versión publicada. Solo
   * `GET /api/farmers` lo trae; `GET /api/farmers/:id` no lo incluye —
   * el detalle exacto se consulta aparte con `getFarmerConsentStatus`.
   */
  hasPendingConsent?: boolean;
}

export interface UpdateFarmerRequest {
  name?: string;
  documentId?: string;
  phone?: string;
  email?: string;
}

export interface UpdateFarmRequest {
  name?: string;
  vereda?: string;
  altitude?: number;
  cropIds?: string[];
}

// Spec 73 — borrado en cascada de un agricultor.
export interface FarmerDeletionCounts {
  farms: number;
  campaignSessions: number;
  surveys: number;
  responses: number;
  documentCollisions: number;
  relations: number;
  /** Constancias de consentimiento informado (spec 78). */
  consentRecords: number;
}

export interface FarmerDeletionFarmInfo {
  farmId: string;
  name: string;
  shared: boolean;
  willBeDeleted: boolean;
}

export interface FarmerDeletionPreview {
  farmerId: string;
  name: string;
  documentId: string | null;
  counts: FarmerDeletionCounts;
  farm: FarmerDeletionFarmInfo | null;
  /** Spec 94 — todas las fincas del productor (la principal también viene en `farm`). */
  farms?: FarmerDeletionFarmInfo[];
  preserved: { changeRequests: number };
}

// ── Change Requests ───────────────────────────────────────────────────────────

export type ChangeRequestSource = "mobile" | "web";
export type ChangeRequestStatus = "open" | "resolved";
export type ChangeRequestCategory = "bug_ui" | "data_error" | "suggestion" | "other";

export interface ChangeRequestUserSummary {
  userId: string;
  name: string;
  lastName: string;
}

export interface ChangeRequestFarmerSummary {
  id: string;
  name: string;
}

export interface ChangeRequestListItem {
  changeRequestId: string;
  description: string;
  source: ChangeRequestSource;
  category: ChangeRequestCategory | null;
  status: ChangeRequestStatus;
  createdBy: ChangeRequestUserSummary;
  farmer: ChangeRequestFarmerSummary | null;
  resolvedBy: ChangeRequestUserSummary | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface CreateChangeRequestWebPayload {
  description: string;
  category: ChangeRequestCategory;
}

// ── Survey history (farmer profile) ─────────────────────────────────────────

export interface InstrumentSummaryForSurvey {
  instrumentId: string;
  name: string;
}

export interface SurveyListItem {
  surveyId: string;
  sincronized: boolean;
  createdAt: string;
  updatedAt: string;
  instruments: InstrumentSummaryForSurvey[];
  /** Spec 94 — finca y cultivo a los que quedó anclada la encuesta. */
  farm?: { farmId: string; name: string } | null;
  crop?: { cropId: string; name: string } | null;
}

export interface SurveyResponseItem {
  responseId: string;
  questionId: string;
  questionText: string;
  questionType: string;
  sectionTitle: string;
  textValue: string | null;
  numericValue: number | null;
  booleanValue: boolean | null;
  optionText: string | null;
  // Spec 86 — la respuesta es a la opción "Otros"; su texto viene en textValue.
  isOther: boolean;
  attachmentId: string | null;
  attachmentStatus: "pending" | "uploaded" | "failed" | null;
  mimeType: string | null;
  originalFilename: string | null;
}

export interface SurveyResponsesResult {
  surveyId: string;
  instrumentName: string | null;
  syncedAt: string;
  responses: SurveyResponseItem[];
}

// ── Bandeja de revisión de envíos públicos (spec 79) ────────────────────────

export type PublicSubmissionReviewStatus = "pending" | "processed" | "discarded";

export interface PublicSubmissionListItem {
  surveyId: string;
  instrumentId: string;
  instrumentName: string;
  createdAt: string;
  responseCount: number;
  reviewStatus: PublicSubmissionReviewStatus;
  /** Spec 93: opcionales, el backend los entrega cuando puede extraerlos. */
  farmerName?: string | null;
  farmerDocumentId?: string | null;
  warnings?: { code: string; message?: string }[];
}

/** Cuerpo del 409 de POST /api/surveys/:id/process-public — colisión de documentId (spec 68). */
export interface DocumentCollisionInfo {
  message: string;
  documentId: string;
  submittedName: string;
  existingFarmer: { farmerId: string; name: string };
}
