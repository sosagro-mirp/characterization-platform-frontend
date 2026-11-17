export type QuestionTypeName =
  | "open_text"
  | "numeric"
  | "numeric_with_unit"
  | "yes_no"
  | "single_choice"
  | "multiple_choice"
  | "likert"
  | "compliance"
  | "image"
  | "voice_recording"
  | "document"
  | "video"
  | (string & {});

export interface InstrumentType {
  typeId: string;
  name: QuestionTypeName;
}

export interface InstrumentOption {
  optionId: string;
  text: string;
  value: string | number | boolean | null;
  isOther?: boolean;
  metadataId?: string | null;
  departmentId?: string | null;
}

export interface InstrumentQuestion {
  questionId: string;
  text: string;
  isRequired: boolean;
  isSelectionCriteria?: boolean;
  isKeyQuestion?: boolean;
  order: number;
  systemField?: string | null;
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
  // Multimedia — solo lectura en web; capturado en mobile y subido a R2.
  // La evidencia se resuelve por URL firmada a partir de `attachmentId` (spec 85).
  attachmentId?: string;
  mimeType?: string;
  originalFilename?: string;
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
  code?: string | null;
  sections: InstrumentSection[];
}

export interface SurveyResponse {
  surveyId: string;
}

export type SubmitResult =
  | { outcome: "submitted" }
  | { outcome: "session_expired" }
  | { outcome: "error"; message: string };

export interface InitializeSurveyPayload {
  localId: string;
  instrumentId: string;
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

// ── Pre-survey form S1/S2 ────────────────────────────────────────────────────

export interface CropSummary {
  cropId: string;
  name: string;
}

export interface FarmerSearchResult {
  id: string;
  name: string;
  documentId: string;
  phone?: string | null;
  farm?: {
    farmId: string;
    name: string;
    town?: { townId: string; name: string } | null;
  } | null;
}

export interface ExtractFarmerResult {
  farmer: FarmerSearchResult;
  existed: boolean;
}

export interface CreateFarmerPayload {
  name: string;
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
