"use client";

import { useEffect } from "react";
import {
  ActorTypeSummary,
  SectionDetail,
  TypeOfQuestionSummary,
} from "@/app/(admin)/types";
import {
  useInstrumentEditorStore,
} from "@/store/useInstrumentEditorStore";
import StructureTree from "./StructureTree";
import InstrumentForm from "./InstrumentForm";
import SectionForm from "./SectionForm";
import QuestionForm from "./QuestionForm";
import NewQuestionForm from "./NewQuestionForm";
import SaveStatusIndicator from "./SaveStatusIndicator";

interface InstrumentEditorLayoutProps {
  instrumentId: string;
  name: string;
  version: number;
  publishDate: string;
  isActive: boolean;
  actorTypes: ActorTypeSummary[];
  sections: SectionDetail[];
  allActorTypes: ActorTypeSummary[];
  questionTypes: TypeOfQuestionSummary[];
}

export default function InstrumentEditorLayout({
  instrumentId,
  name,
  version,
  publishDate,
  isActive,
  actorTypes,
  sections,
  allActorTypes,
  questionTypes,
}: InstrumentEditorLayoutProps) {
  const {
    initialize,
    selection,
    saveStatus,
    saveError,
    sections: storeSections,
    instrumentName,
    instrumentVersion,
    instrumentPublishDate,
    instrumentIsActive,
    instrumentActorTypes,
    updateInstrumentMeta,
  } = useInstrumentEditorStore();

  useEffect(() => {
    initialize({
      instrumentId,
      name,
      version,
      publishDate,
      isActive,
      actorTypes,
      sections,
      questionTypes,
    });
  }, [instrumentId]);

  const renderPanel = () => {
    if (!selection || selection.kind === "instrument") {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
              Configuración general
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {instrumentName}
            </h2>
          </div>
          <InstrumentForm
            actorTypes={allActorTypes}
            initialValues={{
              name: instrumentName,
              version: instrumentVersion,
              publishDate: instrumentPublishDate,
              isActive: instrumentIsActive,
              actorTypeIds: instrumentActorTypes.map((a) => a.actorTypeId),
            }}
            onSubmit={updateInstrumentMeta}
            autoSave
          />
        </div>
      );
    }

    if (selection.kind === "section") {
      const section = storeSections.find(
        (s) => s.sectionId === selection.sectionId
      );
      if (!section) return null;
      return <SectionForm section={section} />;
    }

    if (selection.kind === "new-question") {
      return <NewQuestionForm sectionId={selection.sectionId} />;
    }

    if (selection.kind === "question") {
      const section = storeSections.find(
        (s) => s.sectionId === selection.sectionId
      );
      const question = section?.questions.find(
        (q) => q.questionId === selection.questionId
      );
      if (!section || !question) return null;
      return (
        <QuestionForm
          question={question}
          sectionId={section.sectionId}
          questionTypes={questionTypes}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <h1 className="font-semibold text-[var(--text-primary)] truncate">{instrumentName}</h1>
        <div className="flex items-center gap-4">
          <SaveStatusIndicator status={saveStatus} errorMessage={saveError} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto">
          <StructureTree />
        </aside>

        <section className="flex-1 overflow-y-auto p-6">
          {renderPanel()}
        </section>
      </div>
    </div>
  );
}
