import Link from "next/link";
import { getInstruments } from "@/services/instruments.service";
import InstrumentsTable from "@/components/instrument-editor/InstrumentsTable";

export default async function AdminInstrumentsPage() {
  const instruments = await getInstruments();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Instrumentos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {instruments.length} instrumento{instruments.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/admin/instruments/new"
          className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          Nuevo instrumento
        </Link>
      </div>

      <InstrumentsTable instruments={instruments} />
    </div>
  );
}
