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
  order: number;
  conditionQuestionId?: string;
  conditionValue?: string;
}

export interface UpdateQuestionRequest {
  text?: string;
  typeId?: string;
  isRequired?: boolean;
  isSelectionCriteria?: boolean;
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
