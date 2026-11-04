/**
 * e2e-097 — Spec 97 «Diccionario de datos» (H4 del spec 83): lógica pura del
 * editor de destinos del admin web (criterio C16).
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * El entorno de Vitest de este repositorio es `node` (sin Testing Library),
 * así que aquí solo se prueba lógica pura. Lo visual (selector en
 * `QuestionForm` / `NewQuestionForm`, selector de `metadataId` en
 * `OptionsEditor`) vive en el `test-097` manual.
 *
 * ── Por qué el import es dinámico ─────────────────────────────────────────
 * `tsconfig.json` incluye `**\/*.ts`: un import estático de un módulo que
 * todavía no existe rompería el typecheck de todo el repositorio. Se carga con
 * `import()` sobre un especificador no literal y se tipa con el CONTRATO que
 * la implementación debe exponer. Al implementar, puede pasar a import
 * estático sin cambiar las aserciones.
 *
 * ── Contrato de `lib/system-fields/systemFieldOptions.ts` (nombres propuestos)
 * - `ENTITY_LABELS`: `farmer → "Productor"`, `farm → "Finca"`,
 *   `farmCrop → "Cultivo de la finca"`.
 * - `groupSystemFields(catalog, questionTypeName)`: grupos por entidad en ese
 *   orden, solo con destinos compatibles con el tipo y seleccionables
 *   (`active` y `noSource`, nunca `legacy`); dentro de cada grupo, por
 *   etiqueta (es). Los grupos vacíos no aparecen.
 * - `canonicalSystemField(catalog, raw)`: la clave canónica de un valor
 *   guardado (resuelve alias); `null` si no está en el catálogo.
 * - `duplicateWarning(key, usages, currentQuestionId)`: aviso cuando el destino
 *   ya lo usa otra pregunta (`usages` = `{ questionId, systemField,
 *   instrumentName }[]`, con alias resueltos); `null` si no hay otra.
 * - `metadataCatalogFor(catalog, systemField)`: catálogo de `metadataId` de las
 *   opciones (`crop`, `town`, `department`, `actorType`) o `null`.
 * - `systemFieldErrorMessage(code)`: mensaje en español para
 *   `SYSTEM_FIELD_UNKNOWN | _TYPE_MISMATCH | _LEGACY | _DUPLICATE`; `null` para
 *   cualquier otro código.
 */
import { describe, expect, it } from "vitest";

// ─── carga dinámica del módulo bajo prueba ──────────────────────────────────

async function loadModule<T>(specifier: string): Promise<T> {
  return (await import(/* @vite-ignore */ specifier)) as T;
}

function exported<M, K extends keyof M>(mod: M, name: K, from: string): M[K] {
  const value = (mod as Record<PropertyKey, unknown>)[name];
  if (value === undefined) {
    throw new Error(
      `Spec 97 sin implementar: falta la exportación \`${String(name)}\` en \`${from}\`.`,
    );
  }
  return value as M[K];
}

const MODULE = "./systemFieldOptions";

// ─── contrato esperado ──────────────────────────────────────────────────────

type Entity = "farmer" | "farm" | "farmCrop";

/** Elemento de `GET /api/system-fields` (Contrato de API del spec). */
interface SystemFieldDef {
  key: string;
  entity: Entity;
  field: string | null;
  dataType: string;
  questionTypes: string[];
  metadataCatalog: string | null;
  label: string;
  status: "active" | "noSource" | "legacy";
  aliases: string[];
}

interface Usage {
  questionId: string;
  systemField: string;
  instrumentName: string;
}

interface SystemFieldOptionsModule {
  ENTITY_LABELS: Record<Entity, string>;
  groupSystemFields: (
    catalog: SystemFieldDef[],
    questionTypeName: string,
  ) => { entity: Entity; label: string; fields: SystemFieldDef[] }[];
  canonicalSystemField: (catalog: SystemFieldDef[], raw: string) => string | null;
  duplicateWarning: (
    key: string,
    usages: Usage[],
    currentQuestionId: string | null,
  ) => string | null;
  metadataCatalogFor: (catalog: SystemFieldDef[], systemField: string) => string | null;
  systemFieldErrorMessage: (code: string) => string | null;
}

async function get<K extends keyof SystemFieldOptionsModule>(
  name: K,
): Promise<SystemFieldOptionsModule[K]> {
  const mod = await loadModule<SystemFieldOptionsModule>(MODULE);
  return exported(mod, name, MODULE);
}

// ─── catálogo de prueba ─────────────────────────────────────────────────────

function def(partial: Partial<SystemFieldDef> & Pick<SystemFieldDef, "key" | "entity" | "label">): SystemFieldDef {
  return {
    field: partial.key.split(".").pop() ?? null,
    dataType: "text",
    questionTypes: ["open_text"],
    metadataCatalog: null,
    status: "active",
    aliases: [],
    ...partial,
  };
}

const CATALOG: SystemFieldDef[] = [
  def({ key: "farmer.name", entity: "farmer", label: "Nombre del productor" }),
  def({
    key: "farmer.documentType",
    entity: "farmer",
    label: "Tipo de documento",
    dataType: "option",
    questionTypes: ["single_choice"],
  }),
  def({
    key: "farmer.email",
    entity: "farmer",
    label: "Correo",
    status: "noSource",
  }),
  def({
    key: "farmer.isRespondent",
    entity: "farmer",
    label: "¿Es el encuestado?",
    dataType: "boolean",
    questionTypes: ["yes_no"],
    status: "legacy",
  }),
  def({ key: "farm.vereda", entity: "farm", label: "Vereda" }),
  def({
    key: "farm.area",
    entity: "farm",
    label: "Área del predio",
    dataType: "number",
    questionTypes: ["numeric", "numeric_with_unit"],
  }),
  def({
    key: "farm.crops",
    entity: "farm",
    label: "Cultivos de la finca",
    dataType: "optionList",
    questionTypes: ["single_choice", "multiple_choice"],
    metadataCatalog: "crop",
    aliases: ["farm.mainCrop"],
  }),
  def({
    key: "farm.town",
    entity: "farm",
    label: "Municipio",
    dataType: "option",
    questionTypes: ["single_choice"],
    metadataCatalog: "town",
  }),
  def({
    key: "farm.hasCrop.canamo",
    entity: "farmCrop",
    label: "¿Cultiva cáñamo?",
    dataType: "boolean",
    questionTypes: ["yes_no"],
    aliases: ["crop.canamo"],
  }),
];

// ─── C16 ────────────────────────────────────────────────────────────────────

describe("C16 — selector «Destino del dato»", () => {
  it("las etiquetas de entidad están en español", async () => {
    const labels = await get("ENTITY_LABELS");
    expect(labels).toEqual({
      farmer: "Productor",
      farm: "Finca",
      farmCrop: "Cultivo de la finca",
    });
  });

  it("open_text: agrupa por entidad, en orden, sin legacy ni incompatibles", async () => {
    const group = await get("groupSystemFields");
    const groups = group(CATALOG, "open_text");
    expect(groups.map((g) => g.entity)).toEqual(["farmer", "farm"]);
    expect(groups[0].fields.map((f) => f.key)).toEqual(["farmer.email", "farmer.name"]);
    expect(groups[1].fields.map((f) => f.key)).toEqual(["farm.vereda"]);
  });

  it("yes_no: ofrece el cultivo de la finca y nunca la clave legacy", async () => {
    const group = await get("groupSystemFields");
    const keys = group(CATALOG, "yes_no").flatMap((g) => g.fields.map((f) => f.key));
    expect(keys).toEqual(["farm.hasCrop.canamo"]);
  });

  it("un tipo sin destinos compatibles da una lista vacía", async () => {
    const group = await get("groupSystemFields");
    expect(group(CATALOG, "likert")).toEqual([]);
  });

  it("resuelve alias guardados a su clave canónica", async () => {
    const canonical = await get("canonicalSystemField");
    expect(canonical(CATALOG, "farm.mainCrop")).toBe("farm.crops");
    expect(canonical(CATALOG, "crop.canamo")).toBe("farm.hasCrop.canamo");
    expect(canonical(CATALOG, "farm.crops")).toBe("farm.crops");
    expect(canonical(CATALOG, "foo.bar")).toBeNull();
  });

  it("avisa de duplicado con el instrumento que ya usa el destino (alias incluidos)", async () => {
    const warn = await get("duplicateWarning");
    const usages: Usage[] = [
      { questionId: "q-1", systemField: "farm.crops", instrumentName: "S_REG" },
      { questionId: "q-2", systemField: "farm.vereda", instrumentName: "Taller" },
    ];
    expect(warn("farm.crops", usages, "q-9")).toContain("S_REG");
    expect(warn("farm.crops", usages, "q-1")).toBeNull();
    expect(warn("farm.name", usages, null)).toBeNull();
  });
});

describe("C16 — selector de metadataId por opción", () => {
  it("el catálogo de la opción sale del destino de la pregunta, también por alias", async () => {
    const catalogFor = await get("metadataCatalogFor");
    expect(catalogFor(CATALOG, "farm.crops")).toBe("crop");
    expect(catalogFor(CATALOG, "farm.mainCrop")).toBe("crop");
    expect(catalogFor(CATALOG, "farm.town")).toBe("town");
    expect(catalogFor(CATALOG, "farm.vereda")).toBeNull();
  });
});

describe("C16 — errores SYSTEM_FIELD_* del backend", () => {
  it("traduce los cuatro códigos y deja pasar los demás", async () => {
    const message = await get("systemFieldErrorMessage");
    for (const code of [
      "SYSTEM_FIELD_UNKNOWN",
      "SYSTEM_FIELD_TYPE_MISMATCH",
      "SYSTEM_FIELD_LEGACY",
      "SYSTEM_FIELD_DUPLICATE",
    ]) {
      const text = message(code);
      expect(text).toEqual(expect.any(String));
      expect(text).not.toContain("SYSTEM_FIELD");
    }
    expect(message("OTHER_ERROR")).toBeNull();
  });
});
