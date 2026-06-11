export interface InstrumentType {
  typeId: string;
  name:
    | "open_text"
    | "numeric"
    | "yes_no"
    | "single_choice"
    | "multiple_choice"
    | "likert"
    | "compliance"
    | string;
}

export interface InstrumentOption {
  optionId: string;
  text: string;
  value: string | number | boolean | null;
  isOther?: boolean;
}

export interface InstrumentQuestion {
  questionId: string;
  text: string;
  isRequired: boolean;
  isSelectionCriteria?: boolean;
  order: number;
  type: InstrumentType;
  options: InstrumentOption[];
  conditionQuestionId?: string | null;
  conditionValue?: string | null;
}

export interface InstrumentDraftAnswer {
  questionId: string;
  optionId?: string;
  optionIds?: string[];
  textValue?: string;
  numericValue?: number;
  booleanValue?: boolean;
  otherText?: string;
}

export interface CreateResponsePayload extends InstrumentDraftAnswer {
  surveyId: string;
}

export interface InstrumentSection {
  sectionId: string;
  name: string;
  order: number;
  questions: InstrumentQuestion[];
}

export interface InstrumentResponse {
  instrumentId: string;
  name: string;
  version: number;
  publishDate: string;
  isActive: boolean;
  sections: InstrumentSection[];
}

export interface SurveyResponse {
  surveyId: string;
}

export type SubmitResult =
  | { outcome: "submitted" }
  | { outcome: "saved_offline" }
  | { outcome: "session_expired" }
  | { outcome: "error"; message: string };

export interface InitializeSurveyPayload {
  localId: string;
  instrumentName: string;
  sections: InstrumentSection[];
}

export interface ActorTypeSummary {
  actorTypeId: string;
  name: string;
  description: string | null;
}

export interface InstrumentSummary {
  instrumentId: string;
  name: string;
  version: number;
  publishDate: string;
  isActive: boolean;
  actorTypes: ActorTypeSummary[];
}

// ── Campaign session (encuestador) ───────────────────────────────────────────

export interface CampaignActiveSummary {
  campaignId: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface CampaignStepRender {
  stepId: string;
  order: number;
  instrument: { instrumentId: string; name: string; isActive: boolean };
  conditionQuestion: { questionId: string; text: string } | null;
  conditionValue: string | null;
}

export interface CampaignRender extends CampaignActiveSummary {
  steps: CampaignStepRender[];
}

export interface CampaignSessionResponse {
  sessionId: string;
  campaign: { campaignId: string; name: string };
}

export interface NextStepResponse {
  stepId?: string;
  order?: number;
  instrument?: { instrumentId: string; name: string; isActive: boolean };
  totalSteps?: number;
  completedCount?: number;
  nextStep?: null;
}

export interface CreateCampaignSessionPayload {
  campaignId: string;
  farmerId?: string;
  userId?: string;
  actorTypeId?: string;
  departmentId?: string;
  townId?: string;
  vereda?: string;
  cropId?: string;
  cropIds?: string[];
}

// ── Pre-survey form S1/S2 ────────────────────────────────────────────────────

export interface CropSummary {
  cropId: string;
  name: string;
}

export interface FarmerSearchResult {
  id: string;
  name: string;
  lastName: string;
  documentId: string;
  phone?: string | null;
  farm?: {
    farmId: string;
    name: string;
    town?: { townId: string; name: string } | null;
  } | null;
}

export interface CreateFarmerPayload {
  name: string;
  lastName: string;
  documentId: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: string;
  educationLevel?: string;
  experienceYears?: number;
  familySize?: number;
  isMainIncome?: boolean;
  participationInTraining?: boolean;
  farmName?: string;
  townId?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
}

export interface PreSurveyFormData {
  mode: 'search' | 'create';
  searchQuery: string;
  name: string;
  lastName: string;
  documentId: string;
  phone: string;
  email: string;
  farmName: string;
  departmentId: string;
  townId: string;
  vereda: string;
  latitude: string;
  longitude: string;
  altitude: string;
  cropIds: string[];
  selectedFarmerId: string | null;
}
