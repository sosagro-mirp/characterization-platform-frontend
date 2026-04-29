"use client";

import { useRouter } from "next/navigation";
import {
  ActorTypeSummary,
  CreateInstrumentRequest,
  UpdateInstrumentRequest,
} from "@/app/(admin)/types";
import { createInstrument } from "@/services/instruments.service";
import { createSection } from "@/services/sections.service";
import InstrumentForm from "@/components/instrument-editor/InstrumentForm";

interface NewInstrumentClientProps {
  actorTypes: ActorTypeSummary[];
}

const DEFAULT_FIRST_SECTION_NAME = "Sección 1";

export default function NewInstrumentClient({ actorTypes }: NewInstrumentClientProps) {
  const router = useRouter();

  const handleCreate = async (
    data: CreateInstrumentRequest | UpdateInstrumentRequest
  ) => {
    const instrument = await createInstrument(data as CreateInstrumentRequest);
    try {
      await createSection(instrument.instrumentId, {
        name: DEFAULT_FIRST_SECTION_NAME,
        order: 1,
      });
    } catch {
      // No bloqueamos la creación del instrumento si la sección inicial falla;
      // el usuario podrá agregarla manualmente desde el editor.
    }
    router.push(`/admin/instruments/${instrument.instrumentId}`);
  };

  return (
    <InstrumentForm
      actorTypes={actorTypes}
      onSubmit={handleCreate}
      submitLabel="Crear y continuar"
    />
  );
}
