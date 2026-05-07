import Link from "next/link";
import { getInstruments } from "@/services/instruments.service";
import InstrumentsTable from "@/components/instrument-editor/InstrumentsTable";

export default async function AdminInstrumentsPage() {
  const instruments = await getInstruments();

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Volver al inicio
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Instrumentos</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {instruments.length} instrumento{instruments.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/admin/instruments/new"
          className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] transition-colors"
        >
          Nuevo instrumento
        </Link>
      </div>

      <InstrumentsTable instruments={instruments} />
    </div>
  );
}
