export interface InstrumentType {
  typeId: string;
  name: "open_text" | "numeric" | "single-choice" | string;
}

export interface InstrumentOption {
  optionId: string;
  text: string;
  value: string | number | boolean | null;
}

export interface InstrumentQuestion {
  questionId: string;
  text: string;
  isRequired: boolean;
  order: number;
  type: InstrumentType;
  options: InstrumentOption[];
}

export interface InstrumentDraftAnswer {
  questionId: string;
  optionId?: string;
  optionIds?: string[];
  textValue?: string;
  numericValue?: number;
  booleanValue?: boolean;
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

export interface InitializeSurveyPayload {
  surveyId: string;
  instrumentName: string;
  sections: InstrumentSection[];
}
