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
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nuevo instrumento</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Completa los datos básicos. Luego podrás agregar secciones y preguntas.
        </p>
      </div>
      {error ? (
        <p className="rounded-md border border-[var(--danger-fg)]/40 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      ) : actorTypes === null ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : (
        <NewInstrumentClient actorTypes={actorTypes} />
      )}
    </div>
  );
}
