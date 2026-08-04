"use client";

import { useEffect } from "react";
import { Settings } from "lucide-react";
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

  const formattedPublishDate = instrumentPublishDate
    ? new Date(instrumentPublishDate).toLocaleDateString("es-CO")
    : null;

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
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                <Settings className="size-3.5 shrink-0" aria-hidden="true" />
                Configuración general
              </p>
              <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">
                {instrumentName}
              </h2>
            </div>
            <span className="shrink-0 whitespace-nowrap text-[10.5px] text-[var(--text-muted)]">
              Los cambios se guardan solos
            </span>
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
      return <SectionForm key={section.sectionId} section={section} />;
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
          key={question.questionId}
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
      <header className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--surface-muted)]">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-[var(--text-primary)]">{instrumentName}</h1>
          <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">
            v{instrumentVersion}
            {formattedPublishDate && ` · publicado el ${formattedPublishDate}`}
          </p>
        </div>
        <SaveStatusIndicator status={saveStatus} errorMessage={saveError} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="scrollbar-hide w-[420px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto">
          <StructureTree />
        </aside>

        <section className="flex-1 overflow-y-auto p-6">
          {renderPanel()}
        </section>
      </div>
    </div>
  );
}
