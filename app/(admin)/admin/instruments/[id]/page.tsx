"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ActorTypeSummary,
  SectionDetail,
  TypeOfQuestionSummary,
} from "@/app/(admin)/types";
import { getActorTypes } from "@/services/actor-types.service";
import { getInstrumentForEditor } from "@/services/instruments.service";
import { getTypesOfQuestions } from "@/services/types-of-questions.service";
import InstrumentEditorLayout from "@/components/instrument-editor/InstrumentEditorLayout";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface EditorData {
  instrumentId: string;
  name: string;
  version: number;
  publishDate: string;
  isActive: boolean;
  actorTypes: ActorTypeSummary[];
  sections: SectionDetail[];
}

export default function InstrumentEditorPage({ params }: PageProps) {
  const { id } = use(params);

  const [editor, setEditor] = useState<EditorData | null>(null);
  const [allActorTypes, setAllActorTypes] = useState<ActorTypeSummary[]>([]);
  const [questionTypes, setQuestionTypes] = useState<TypeOfQuestionSummary[]>(
    [],
  );
  const [status, setStatus] = useState<"loading" | "ready" | "not-found" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all([
      getInstrumentForEditor(id).catch(() => null),
      getActorTypes(),
      getTypesOfQuestions(),
    ])
      .then(([editorData, actorTypes, qTypes]) => {
        if (cancelled) return;
        if (!editorData) {
          setStatus("not-found");
          return;
        }
        setEditor(editorData);
        setAllActorTypes(actorTypes);
        setQuestionTypes(qTypes);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(
          err instanceof Error ? err.message : "Error al cargar el instrumento",
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <p className="p-4 text-sm text-[var(--text-muted)]">Cargando instrumento…</p>
    );
  }

  if (status === "not-found") {
    return (
      <div className="p-4">
        <p className="text-sm text-[var(--text-primary)]">Instrumento no encontrado.</p>
        <Link
          href="/admin/instruments"
          className="mt-3 inline-block text-sm text-brand hover:underline"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  if (status === "error" || !editor) {
    return (
      <div className="p-4">
        <p className="rounded-md border border-[var(--danger-fg)]/40 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {errorMessage ?? "Error al cargar el instrumento."}
        </p>
        <Link
          href="/admin/instruments"
          className="mt-3 inline-block text-sm text-brand hover:underline"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 6rem)" }}>
      <div className="mb-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link
          href="/admin/instruments"
          className="hover:text-[var(--text-primary)] transition-colors"
        >
          Instrumentos
        </Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-medium">{editor.name}</span>
      </div>

      <div className="flex-1 rounded-2xl border border-[var(--border)] overflow-hidden">
        <InstrumentEditorLayout
          instrumentId={editor.instrumentId}
          name={editor.name}
          version={editor.version}
          publishDate={editor.publishDate}
          isActive={editor.isActive}
          actorTypes={editor.actorTypes}
          sections={editor.sections}
          allActorTypes={allActorTypes}
          questionTypes={questionTypes}
        />
      </div>
    </div>
  );
}
