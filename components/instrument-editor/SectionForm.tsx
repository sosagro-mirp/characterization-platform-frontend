"use client";

import { useEffect, useState } from "react";
import { SectionDetail } from "@/app/(admin)/types";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";

interface SectionFormProps {
  section: SectionDetail;
}

export default function SectionForm({ section }: SectionFormProps) {
  const { updateSectionInStore } = useInstrumentEditorStore();
  const [name, setName] = useState(section.name);

  useEffect(() => {
    setName(section.name);
  }, [section.sectionId, section.name]);

  const handleBlur = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === section.name) return;
    await updateSectionInStore(section.sectionId, { name: trimmed });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
          Sección
        </p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{section.name}</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Nombre de la sección
        </label>
        <input
          type="text"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Los cambios se guardan automáticamente al salir del campo.
        </p>
      </div>

      <div className="rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] px-4 py-3">
        <p className="text-sm text-[var(--text-muted)]">
          <span className="font-medium">{section.questions.length}</span>{" "}
          pregunta{section.questions.length !== 1 ? "s" : ""} en esta sección.
          Usa el árbol de la izquierda para agregar o gestionar preguntas.
        </p>
      </div>
    </div>
  );
}
