import Link from "next/link";
import { Plus } from "lucide-react";
import { getInstruments } from "@/services/instruments.service";
import InstrumentsTable from "@/components/instrument-editor/InstrumentsTable";
import AdminOnly from "@/components/admin/AdminOnly";

export default async function AdminInstrumentsPage() {
  const instruments = await getInstruments();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Instrumentos</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {instruments.length} instrumento{instruments.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <AdminOnly>
          <Link
            href="/admin/instruments/new"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
          >
            <Plus className="size-5 shrink-0" />
            Nuevo instrumento
          </Link>
        </AdminOnly>
      </div>

      <InstrumentsTable instruments={instruments} />
    </div>
  );
}
