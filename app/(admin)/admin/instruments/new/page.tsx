import { getActorTypes } from "@/services/actor-types.service";
import NewInstrumentClient from "./NewInstrumentClient";

export default async function NewInstrumentPage() {
  const actorTypes = await getActorTypes();

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Nuevo instrumento</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Completa los datos básicos. Luego podrás agregar secciones y preguntas.
        </p>
      </div>
      <NewInstrumentClient actorTypes={actorTypes} />
    </div>
  );
}
