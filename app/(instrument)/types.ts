export interface InstrumentType {
  typeId: string;
  name: "open_text" | "numeric" | "single_choice" | string;
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
