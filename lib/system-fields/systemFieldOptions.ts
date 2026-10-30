/**
 * Spec 97 (H4 del spec 83) — lógica pura del editor de destinos del admin web.
 * El catálogo viene de `GET /api/system-fields`; aquí solo se agrupa, filtra y
 * traduce. Sin React ni red, para poder probarla en Vitest.
 */

export type SystemFieldEntity = "farmer" | "farm" | "farmCrop";

export type MetadataCatalog = "department" | "town" | "crop" | "actorType";

/** Elemento de `GET /api/system-fields`. */
export interface SystemFieldDef {
  key: string;
  entity: SystemFieldEntity;
  field: string | null;
  dataType: string;
  questionTypes: string[];
  metadataCatalog: MetadataCatalog | null;
  label: string;
  status: "active" | "noSource" | "legacy";
  aliases: string[];
}

export interface SystemFieldUsage {
  questionId: string;
  systemField: string;
  instrumentName: string;
}

export interface SystemFieldGroup {
  entity: SystemFieldEntity;
  label: string;
  fields: SystemFieldDef[];
}

export const ENTITY_LABELS: Record<SystemFieldEntity, string> = {
  farmer: "Productor",
  farm: "Finca",
  farmCrop: "Cultivo de la finca",
};

const ENTITY_ORDER: SystemFieldEntity[] = ["farmer", "farm", "farmCrop"];

/** Destinos que se pueden asignar a una pregunta de ese tipo, agrupados por entidad. */
export function groupSystemFields(
  catalog: SystemFieldDef[],
  questionTypeName: string,
): SystemFieldGroup[] {
  return ENTITY_ORDER.map((entity) => ({
    entity,
    label: ENTITY_LABELS[entity],
    fields: catalog
      .filter(
        (def) =>
          def.entity === entity &&
          def.status !== "legacy" &&
          def.questionTypes.includes(questionTypeName),
      )
      .sort((a, b) => a.label.localeCompare(b.label, "es")),
  })).filter((group) => group.fields.length > 0);
}

function findDef(catalog: SystemFieldDef[], raw: string): SystemFieldDef | null {
  const key = raw.trim();
  return (
    catalog.find((def) => def.key === key || def.aliases.includes(key)) ?? null
  );
}

/** Clave canónica de un valor guardado (resuelve alias); `null` si no está en el catálogo. */
export function canonicalSystemField(
  catalog: SystemFieldDef[],
  raw: string,
): string | null {
  return findDef(catalog, raw)?.key ?? null;
}

/**
 * Aviso cuando otra pregunta ya usa el destino. `usages` trae las preguntas
 * conocidas con su `systemField` ya resuelto a canónico.
 */
export function duplicateWarning(
  key: string,
  usages: SystemFieldUsage[],
  currentQuestionId: string | null,
): string | null {
  const other = usages.find(
    (usage) =>
      usage.systemField === key && usage.questionId !== currentQuestionId,
  );
  if (!other) return null;
  return `Este destino ya lo usa otra pregunta de «${other.instrumentName}».`;
}

/** Catálogo de `metadataId` de las opciones de una pregunta, según su destino (alias incluidos). */
export function metadataCatalogFor(
  catalog: SystemFieldDef[],
  systemField: string,
): MetadataCatalog | null {
  return findDef(catalog, systemField)?.metadataCatalog ?? null;
}

const ERROR_MESSAGES: Record<string, string> = {
  SYSTEM_FIELD_UNKNOWN:
    "Ese destino no existe en el catálogo. Elija uno de la lista.",
  SYSTEM_FIELD_TYPE_MISMATCH:
    "Ese destino no es compatible con el tipo de pregunta. Elija otro destino o cambie el tipo.",
  SYSTEM_FIELD_LEGACY:
    "Ese destino está en desuso y no se puede asignar a preguntas nuevas.",
  SYSTEM_FIELD_DUPLICATE:
    "Otra pregunta de este instrumento ya usa ese destino.",
};

/** Mensaje en español para un código `SYSTEM_FIELD_*`; `null` para cualquier otro. */
export function systemFieldErrorMessage(code: string): string | null {
  return ERROR_MESSAGES[code] ?? null;
}
