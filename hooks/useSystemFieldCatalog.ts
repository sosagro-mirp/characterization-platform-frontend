"use client";

import { useEffect, useState } from "react";
import { listSystemFields } from "@/services/system-fields.service";
import type { SystemFieldDef } from "@/lib/system-fields/systemFieldOptions";

// Spec 97 — el catálogo cambia solo con un despliegue del backend: se pide una
// vez por carga de página y se comparte entre el formulario y las opciones.
let cached: Promise<SystemFieldDef[]> | null = null;

function loadCatalog(): Promise<SystemFieldDef[]> {
  if (!cached) {
    cached = listSystemFields().catch((err) => {
      cached = null;
      throw err;
    });
  }
  return cached;
}

/** Catálogo de destinos; `[]` mientras carga o si falla (el selector queda vacío, no rompe el editor). */
export function useSystemFieldCatalog(): {
  catalog: SystemFieldDef[];
  loading: boolean;
} {
  const [catalog, setCatalog] = useState<SystemFieldDef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((data) => active && setCatalog(data))
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { catalog, loading };
}
