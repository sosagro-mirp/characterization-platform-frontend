import type { FarmDetail, FarmerFarm, FarmRole } from "@/app/(admin)/types";

export type { FarmRole };

/** Spec 94 (D-H3-3) — catálogo de roles del productor en una finca, en orden. */
export const FARM_ROLES: readonly FarmRole[] = [
  "owner",
  "producer",
  "manager",
  "worker",
  "family",
  "other",
];

export const DEFAULT_FARM_ROLE: FarmRole = "producer";

const ROLE_LABELS: Record<FarmRole, string> = {
  owner: "Propietario",
  producer: "Productor",
  manager: "Administrador",
  worker: "Trabajador",
  family: "Familiar",
  other: "Otro",
};

/** Etiqueta en español del rol; un rol desconocido cae en "Otro". */
export function farmRoleLabel(role: string): string {
  return (ROLE_LABELS as Record<string, string>)[role] ?? ROLE_LABELS.other;
}

export const FARM_ROLE_OPTIONS: readonly { value: FarmRole; label: string }[] =
  FARM_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }));

export interface PresentedFarm {
  farmId: string;
  name: string;
  vereda: string | null;
  townName: string | null;
  role: FarmRole;
  roleLabel: string;
  isPrimary: boolean;
  cropNames: string[];
}

/** Fincas listas para la ficha: la principal primero, luego por nombre (es). Sin mutar la entrada. */
export function presentFarmerFarms(farms: FarmerFarm[]): PresentedFarm[] {
  return [...farms]
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.name.localeCompare(b.name, "es");
    })
    .map((f) => ({
      farmId: f.farmId,
      name: f.name,
      vereda: f.vereda,
      townName: f.town?.name ?? null,
      role: f.role,
      roleLabel: farmRoleLabel(f.role),
      isPrimary: f.isPrimary,
      cropNames: f.crops.map((c) => c.name),
    }));
}

/** La finca principal del productor, o `null` si no tiene. */
export function primaryFarm(farms: FarmerFarm[]): FarmerFarm | null {
  return farms.find((f) => f.isPrimary) ?? null;
}

/**
 * Aviso al editar los cultivos de una finca que comparten otros productores
 * (`farmers[]` de `GET /farms/:id`); `null` si no es compartida.
 */
export function sharedFarmCropsWarning(
  farm: Pick<FarmDetail, "farmers">,
  currentFarmerId: string,
): string | null {
  const others = farm.farmers.filter((f) => f.farmerId !== currentFarmerId);
  if (others.length === 0) return null;
  const names = others.map((f) => f.name).join(", ");
  return `Esta finca también se usa en otros registros (${names}). Los cambios en sus cultivos se verán en todos los productores vinculados.`;
}
