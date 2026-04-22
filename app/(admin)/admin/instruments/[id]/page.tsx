import Link from "next/link";
import { notFound } from "next/navigation";
import { getActorTypes } from "@/services/actor-types.service";
import { getInstrumentForEditor } from "@/services/instruments.service";
import { getTypesOfQuestions } from "@/services/types-of-questions.service";
import InstrumentEditorLayout from "@/components/instrument-editor/InstrumentEditorLayout";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InstrumentEditorPage({ params }: PageProps) {
  const { id } = await params;

  const [editor, actorTypes, questionTypes] = await Promise.all([
    getInstrumentForEditor(id).catch(() => null),
    getActorTypes(),
    getTypesOfQuestions(),
  ]);

  if (!editor) notFound();

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 6rem)" }}>
      <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
        <Link
          href="/admin/instruments"
          className="hover:text-neutral-900 transition-colors"
        >
          Instrumentos
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-medium">{editor.name}</span>
      </div>

      <div className="flex-1 rounded-2xl border border-neutral-200 overflow-hidden">
        <InstrumentEditorLayout
          instrumentId={editor.instrumentId}
          name={editor.name}
          version={editor.version}
          publishDate={editor.publishDate}
          isActive={editor.isActive}
          actorTypes={editor.actorTypes}
          sections={editor.sections}
          allActorTypes={actorTypes}
          questionTypes={questionTypes}
        />
      </div>
    </div>
  );
}
