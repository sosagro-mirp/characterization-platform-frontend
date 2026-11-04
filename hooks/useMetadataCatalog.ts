"use client";

import { useEffect, useState } from "react";
import { getActorTypes } from "@/services/actor-types.service";
import { listDepartments } from "@/services/departments.service";
import { listPublicTowns } from "@/services/towns.service";
import { listCrops } from "@/services/types-of-crops.service";
import type { MetadataCatalog } from "@/lib/system-fields/systemFieldOptions";

export interface MetadataEntry {
  id: string;
  name: string;
}

export const METADATA_CATALOG_LABELS: Record<MetadataCatalog, string> = {
  crop: "cultivo",
  department: "departamento",
  town: "municipio",
  actorType: "tipo de actor",
};

const FETCHERS: Record<MetadataCatalog, () => Promise<MetadataEntry[]>> = {
  crop: async () =>
    (await listCrops()).map((c) => ({ id: c.cropId, name: c.name })),
  department: async () =>
    (await listDepartments()).map((d) => ({ id: d.departmentId, name: d.name })),
  // Ruta pública: la protegida es solo de administrador y el investigador
  // también edita instrumentos (spec 93).
  town: async () =>
    (await listPublicTowns()).map((t) => ({
      id: t.townId,
      name: t.department ? `${t.name} (${t.department.name})` : t.name,
    })),
  actorType: async () =>
    (await getActorTypes()).map((a) => ({ id: a.actorTypeId, name: a.name })),
};

const cache = new Map<MetadataCatalog, Promise<MetadataEntry[]>>();

function load(kind: MetadataCatalog): Promise<MetadataEntry[]> {
  let promise = cache.get(kind);
  if (!promise) {
    promise = FETCHERS[kind]().catch((err) => {
      cache.delete(kind);
      throw err;
    });
    cache.set(kind, promise);
  }
  return promise;
}

/** Filas del catálogo al que apuntan las opciones; `[]` sin catálogo, mientras carga o si falla. */
export function useMetadataCatalog(kind: MetadataCatalog | null): {
  entries: MetadataEntry[];
  loading: boolean;
} {
  const [state, setState] = useState<{
    kind: MetadataCatalog | null;
    entries: MetadataEntry[];
  }>({ kind: null, entries: [] });

  useEffect(() => {
    if (!kind) return;
    let active = true;
    load(kind)
      .then((entries) => active && setState({ kind, entries }))
      .catch(() => active && setState({ kind, entries: [] }));
    return () => {
      active = false;
    };
  }, [kind]);

  return {
    entries: state.kind === kind ? state.entries : [],
    loading: kind !== null && state.kind !== kind,
  };
}
