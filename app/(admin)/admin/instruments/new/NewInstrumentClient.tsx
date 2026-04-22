"use client";

import { useRouter } from "next/navigation";
import {
  ActorTypeSummary,
  CreateInstrumentRequest,
  UpdateInstrumentRequest,
} from "@/app/(admin)/types";
import { createInstrument } from "@/services/instruments.service";
import InstrumentForm from "@/components/instrument-editor/InstrumentForm";

interface NewInstrumentClientProps {
  actorTypes: ActorTypeSummary[];
}

export default function NewInstrumentClient({ actorTypes }: NewInstrumentClientProps) {
  const router = useRouter();

  const handleCreate = async (
    data: CreateInstrumentRequest | UpdateInstrumentRequest
  ) => {
    const instrument = await createInstrument(data as CreateInstrumentRequest);
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
