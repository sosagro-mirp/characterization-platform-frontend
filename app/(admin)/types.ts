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
  actorTypeIds?: string[];
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

export interface FarmerDetail {
  id: string;
  name: string;
  lastName: string | null;
  documentId: string | null;
  phone: string | null;
  email: string | null;
  farm: FarmSummaryForFarmer | null;
  createdAt: string;
}

export interface UpdateFarmerRequest {
  name?: string;
  lastName?: string;
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
  lastName: string | null;
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
  publicUrl: string | null;
  mimeType: string | null;
  originalFilename: string | null;
}

export interface SurveyResponsesResult {
  surveyId: string;
  instrumentName: string | null;
  syncedAt: string;
  responses: SurveyResponseItem[];
}
