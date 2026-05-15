import Link from "next/link";
import InstrumentList from "@/components/instrument/InstrumentList";
import { InstrumentSummary } from "@/app/(instrument)/types";

async function getActiveInstruments(): Promise<InstrumentSummary[]> {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${apiBase}/api/instruments`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Error al obtener instrumentos: ${res.status} ${res.statusText}`
    );
  }

  const instruments: InstrumentSummary[] = await res.json();
  return instruments.filter((i) => i.isActive);
}

export default async function InstrumentListPage() {
  let instruments: InstrumentSummary[] = [];
  let fetchError: string | null = null;

  try {
    instruments = await getActiveInstruments();
  } catch (err) {
    fetchError =
      err instanceof Error
        ? err.message
        : "Error desconocido al cargar instrumentos.";
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Instrumentos disponibles
        </h1>
        <p className="mt-1 md:mt-6 text-sm text-neutral-500">
          Selecciona el instrumento que deseas aplicar en campo.
        </p>
      </header>

      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ¿Vas a aplicar varias encuestas a un mismo agricultor?{" "}
        <Link href="/campaign" className="font-semibold underline">
          Aplica una campaña encadenada
        </Link>{" "}
        para capturar el contexto una sola vez.
      </div>

      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      {!fetchError && <InstrumentList instruments={instruments} />}
    </main>
  );
}
