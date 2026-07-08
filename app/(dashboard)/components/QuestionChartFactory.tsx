"use client";

import type { ComponentType } from "react";
import {
  ComplianceChart,
  LikertChart,
  MultipleChoiceChart,
  NumericChart,
  SingleChoiceChart,
  UnsupportedQuestionType,
  YesNoChart,
} from "./charts";
import { DashboardQuestion } from "../types";

const CHART_BY_TYPE: Record<string, ComponentType<{ question: DashboardQuestion }>> = {
  yes_no: YesNoChart,
  single_choice: SingleChoiceChart,
  multiple_choice: MultipleChoiceChart,
  likert: LikertChart,
  compliance: ComplianceChart,
  numeric: NumericChart,
};

interface QuestionChartFactoryProps {
  question: DashboardQuestion;
}

export default function QuestionChartFactory({ question }: QuestionChartFactoryProps) {
  const Chart = CHART_BY_TYPE[question.questionType];
  if (!Chart) return <UnsupportedQuestionType />;
  return <Chart question={question} />;
}
