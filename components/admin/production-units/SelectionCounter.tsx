"use client";

import { overTarget } from "@/lib/production-units/selection";
import type { SelectionSummary } from "@/services/unit-selections.service";

/** Avance frente a la meta, por cultivo y departamento. Aviso, no tope. */
export function SelectionCounter({ summary }: { summary: SelectionSummary }) {
  const included = summary.total.included;
  const over = overTarget(included, summary.target);
  return (
    <section
      aria-label="Avance de la selección"
      className="space-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p
          className={`text-2xl font-semibold ${over ? "text-[var(--warning-fg)]" : "text-[var(--text-primary)]"}`}
        >
          {included} de {summary.target}
          <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">
            incluidas
          </span>
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {summary.total.in_review} en revisión · {summary.total.excluded}{" "}
          excluidas · {summary.total.none} sin decisión
        </p>
      </div>
      {over && (
        <p className="rounded-lg bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
          Hay más fincas incluidas que la meta de {summary.target}. Es un aviso:
          no se bloquea.
        </p>
      )}
      <div className="grid gap-4 text-xs sm:grid-cols-2">
        <Breakdown title="Por cultivo" items={summary.byCrop} />
        <Breakdown title="Por departamento" items={summary.byDepartment} />
      </div>
    </section>
  );
}

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: {
    name: string;
    included: number;
    in_review: number;
    excluded: number;
  }[];
}) {
  return (
    <div>
      <h3 className="mb-1 font-semibold text-[var(--text-primary)]">{title}</h3>
      {items.length === 0 ? (
        <p className="text-[var(--text-muted)]">Sin decisiones todavía.</p>
      ) : (
        <ul className="space-y-0.5 text-[var(--text-muted)]">
          {items.map((i) => (
            <li key={i.name} className="flex justify-between gap-3">
              <span>{i.name}</span>
              <span>
                {i.included} incl. · {i.in_review} rev. · {i.excluded} excl.
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
