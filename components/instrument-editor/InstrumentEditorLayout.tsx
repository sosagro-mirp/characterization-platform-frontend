"use client";

import { useEffect, useMemo } from "react";
import { Settings } from "lucide-react";
import {
  ActorTypeSummary,
  SectionDetail,
  TypeOfQuestionSummary,
  UserAuditSummary,
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
  isPublic: boolean;
  actorTypes: ActorTypeSummary[];
  createdBy?: UserAuditSummary | null;
  updatedBy?: UserAuditSummary | null;
  sections: SectionDetail[];
  allActorTypes: ActorTypeSummary[];
  questionTypes: TypeOfQuestionSummary[];
}

// Spec 79 — mismo set que InstrumentsService.MEDIA_QUESTION_TYPES en el
// backend: preguntas que exigen el flujo autenticado de media-attachments,
// incompatible con el canal público sin autenticación.
const PUBLIC_INCOMPATIBLE_TYPES: Record<string, string> = {
  image: "imagen",
  voice_recording: "grabación de voz",
  document: "documento",
  video: "video",
};

export default function InstrumentEditorLayout({
  instrumentId,
  name,
  version,
  publishDate,
  isActive,
  isPublic,
  actorTypes,
  createdBy,
  updatedBy,
  sections,
  allActorTypes,
  questionTypes,
}: InstrumentEditorLayoutProps) {
  const {
    instrumentId: storeInstrumentId,
    initialize,
    selection,
    saveStatus,
    saveError,
    sections: storeSections,
    instrumentName,
    instrumentVersion,
    instrumentPublishDate,
    instrumentIsActive,
    instrumentIsPublic,
    instrumentActorTypes,
    updateInstrumentMeta,
  } = useInstrumentEditorStore();

  // Hallazgo TC-079-008 — InstrumentEditorLayout monta InstrumentForm en su
  // primer render, antes de que el useEffect de abajo llame a initialize().
  // InstrumentForm solo lee sus `initialValues` una vez (useState), así que
  // si montara con el store todavía en su estado por defecto
  // (instrumentIsPublic/instrumentIsActive: false), quedaría congelado en
  // ese valor aunque el store se actualice segundos después con el real.
  // Esperar a que storeInstrumentId coincida con la prop evita montarlo con
  // datos que sabemos que van a cambiar.
  const storeReady = storeInstrumentId === instrumentId;

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
      isPublic,
      actorTypes,
      sections,
      questionTypes,
    });
  }, [instrumentId]);

  // Spec 79, criterio 3 — se calcula desde el árbol vivo del store (no de
  // la prop `sections` inicial) para reflejar preguntas agregadas o
  // eliminadas después de cargar la página, sin esperar al intento de
  // activar el toggle.
  const mediaTypesPresent = useMemo(() => {
    const found = new Set<string>();
    storeSections.forEach((section) => {
      section.questions.forEach((question) => {
        const label = PUBLIC_INCOMPATIBLE_TYPES[question.type.name];
        if (label) found.add(label);
      });
    });
    return [...found];
  }, [storeSections]);

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
          {!storeReady ? (
            <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
          ) : (
          <InstrumentForm
            actorTypes={allActorTypes}
            initialValues={{
              name: instrumentName,
              version: instrumentVersion,
              publishDate: instrumentPublishDate,
              isActive: instrumentIsActive,
              isPublic: instrumentIsPublic,
              actorTypeIds: instrumentActorTypes.map((a) => a.actorTypeId),
            }}
            instrumentId={instrumentId}
            mediaTypesPresent={mediaTypesPresent}
            onSubmit={updateInstrumentMeta}
            autoSave
          />
          )}
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
          <div className="mt-1 flex flex-wrap gap-4 text-[10.5px] text-[var(--text-muted)]">
            <div>
              <span className="font-medium text-[var(--text-primary)]">Creado por:</span>{" "}
              {createdBy
                ? `${createdBy.name} ${createdBy.lastName}`
                : "sin registro (anterior al registro de auditoría)"}
            </div>
            {updatedBy && (
              <div>
                <span className="font-medium text-[var(--text-primary)]">Actualizado por:</span>{" "}
                {`${updatedBy.name} ${updatedBy.lastName}`}
              </div>
            )}
          </div>
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
