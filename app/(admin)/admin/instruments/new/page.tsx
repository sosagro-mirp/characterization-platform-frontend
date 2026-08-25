"use client";

import { useEffect, useState } from "react";
import { ActorTypeSummary } from "@/app/(admin)/types";
import { getActorTypes } from "@/services/actor-types.service";
import NewInstrumentClient from "./NewInstrumentClient";

export default function NewInstrumentPage() {
  const [actorTypes, setActorTypes] = useState<ActorTypeSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActorTypes()
      .then((data) => {
        if (!cancelled) setActorTypes(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar datos");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Nuevo instrumento</h1>

      {error && (
        <p className="rounded-md border border-[var(--danger-fg)]/40 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}

      {!error && actorTypes === null && (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      )}

      {!error && actorTypes !== null && (
        <section className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-6 py-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Datos básicos
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Luego podrás agregar secciones y preguntas.
            </p>
          </div>
          <div className="p-6">
            <NewInstrumentClient actorTypes={actorTypes} />
          </div>
        </section>
      )}
    </div>
  );
}
