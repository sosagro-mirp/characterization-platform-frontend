/**
 * e2e-095 — Spec 95 «Extracción unificada»: lógica pura del frontend.
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre la parte web de la extracción en el backend (D-H3-12 del spec 94
 * original, antes de dividirlo):
 *
 *   - el orquestador web de pre-encuesta registra un productor leyendo
 *     `GET /surveys/:id/extraction` tras el batch, **sin llamar a
 *     `extract-farmer` ni a `extract-crops`**, y sigue mostrando el aviso de
 *     colisión (que se resuelve con `extract-farmer {resolution}`);
 *   - la ficha del agricultor muestra las discrepancias abiertas en solo
 *     lectura (D-H3-6);
 *   - la bandeja pública envía el rol al vincular finca y muestra el
 *     resultado con finca, cultivos de finca y rol.
 *
 * El modelo N:M (fincas con rol, finca compartida, borrado con varias fincas)
 * es del spec 94: `lib/farmers/e2e-094-farmerFarms.test.ts`.
 *
 * El entorno de Vitest de este repositorio es `node` (sin Testing Library), así
 * que aquí solo se prueba lógica pura. Lo visual vive en el `test-095` manual.
 *
 * ── Por qué los imports son dinámicos ──────────────────────────────────────
 * `tsconfig.json` incluye `**\/*.ts`, así que un import estático de un módulo o
 * de una exportación que todavía no existe rompería el typecheck de todo el
 * repositorio. Cada módulo se carga con `import()` sobre un especificador no
 * literal y se tipa con el CONTRATO que la implementación debe exponer
 * (interfaces `*Module` de abajo). Al implementar, este archivo puede pasar a
 * imports estáticos sin cambiar las aserciones.
 *
 * ── Contrato que el spec 95 debe exponer (nombres propuestos) ──────────────
 *
 * 1. `lib/campaign-session/preSurveyFlow.ts` (amplía el del spec 84)
 *    - `completeAfterBatch(surveyId, phase, deps)`: tras el batch consulta
 *      `deps.getExtraction(surveyId)` (`GET /surveys/:id/extraction`, que trae
 *      `farmerName`) y decide según `status`:
 *        · `done` / `backfilled` → `onFarmer(farmerId, farmerName)` y devuelve
 *                        `{phase:"done"}` (Registro) o
 *                        `{phase:"s2_pending", instrumentId}` (S1 legado);
 *        · `not_applicable` → avanza igual, sin productor nuevo;
 *        · `collision` → devuelve `{phase:"collision", pending}` con un
 *                        `CollisionPending` compatible con el diálogo actual y
 *                        con `resolveCollisionFlow` (que resuelve con
 *                        `extract-farmer {resolution}`);
 *        · `error`, `no_identity`, `pending_alias` → rechaza con un mensaje en
 *                        español (la web lo muestra y no avanza), sin marcar
 *                        productor.
 *      Nunca llama a `extract-farmer` ni a `extract-crops`.
 *    - NOTA: `resolveCollisionFlow` todavía llama a `extractCrops` tras
 *      resolver una colisión en el Registro, y `e2e-084-preSurveyFlow.test.ts`
 *      lo exige. Esa llamada sobra con la extracción unificada (el alias
 *      `extract-farmer` ya extrae los cultivos) y se quitará en el spec 95 con
 *      un ajuste APROBADO de e2e-084. Este archivo no lo afirma en ningún
 *      sentido para no chocar con e2e-084.
 *
 * 2. `lib/farmers/farmerFarms.ts` (módulo que crea el spec 94)
 *    - `summarizeOpenDiscrepancies(discrepancies)`: lista de solo lectura con
 *      las discrepancias `open` (más recientes primero), con entidad, campo y
 *      valores en texto legible (sin `snake_case` ni `null` crudo). Vive junto
 *      a la presentación de fincas porque la ficha las consume juntas; si se
 *      prefiere un módulo propio (`lib/farmers/discrepancies.ts`), basta con
 *      cambiar `DISCREPANCIES` abajo.
 *
 * 3. `lib/public-submissions/processPreview.ts` (spec 93 + rol)
 *    - `buildProcessBody({..., role})` agrega `role` al cuerpo de
 *      `process-public` cuando se elige; rechaza un rol fuera del catálogo.
 *    - `describePreview(preview)` expone `defaultRole: "producer"`.
 *    - `describeProcessResult(result)`: lectura del resultado de
 *      `process-public` (finca, cultivos de finca y rol en español).
 *
 * Forma de `GET /surveys/:id/extraction`: `status, farmerId, farmerName,
 * existed, clientFarmerId, farm, farmCropId, crops, collision?,
 * openDiscrepancies, extractedAt`. `collision` reutiliza el cuerpo del 409 del
 * spec 68 (`documentId, submittedName, existingFarmer`). Si el backend fija
 * otros nombres de campo, se ajustan aquí y en la implementación en el mismo
 * cambio.
 */
import { describe, expect, it, vi } from "vitest";

// ─── carga dinámica de los módulos bajo prueba ──────────────────────────────

async function loadModule<T>(specifier: string): Promise<T> {
  return (await import(/* @vite-ignore */ specifier)) as T;
}

/** Devuelve la exportación pedida o falla con un mensaje claro si no existe. */
function exported<M, K extends keyof M>(mod: M, name: K, from: string): M[K] {
  const value = (mod as Record<PropertyKey, unknown>)[name];
  if (value === undefined) {
    throw new Error(
      `Spec 95 sin implementar: falta la exportación \`${String(name)}\` en \`${from}\`.`,
    );
  }
  return value as M[K];
}

const PRE_SURVEY_FLOW = "./preSurveyFlow";
const DISCREPANCIES = "../farmers/farmerFarms";
const PROCESS_PREVIEW = "../public-submissions/processPreview";

// ─── contratos esperados ────────────────────────────────────────────────────

type FarmRole = "owner" | "producer" | "manager" | "worker" | "family" | "other";

type CollisionPhase = "registro_pending" | "s1_pending";

interface CollisionPending {
  surveyId: string;
  submittedName: string;
  existingFarmerName: string;
  phase: CollisionPhase;
}

type ExtractionStatus =
  | "done"
  | "collision"
  | "no_identity"
  | "pending_alias"
  | "not_applicable"
  | "awaiting_review"
  | "error"
  | "backfilled";

/** `GET /surveys/:id/extraction`. */
interface SurveyExtraction {
  status: ExtractionStatus | null;
  farmerId: string | null;
  farmerName: string | null;
  existed: boolean | null;
  clientFarmerId: string | null;
  farm: { farmId: string; name: string } | null;
  farmCropId: string | null;
  crops: { cropId: string; name: string }[];
  collision?: {
    documentId: string;
    submittedName: string;
    existingFarmer: { farmerId: string; name: string };
  };
  openDiscrepancies: number;
  extractedAt: string | null;
}

interface CompleteAfterBatchDeps {
  getExtraction: (surveyId: string) => Promise<SurveyExtraction>;
  getInstrumentByCode: (code: string) => Promise<{ instrumentId: string }>;
  onFarmer: (farmerId: string, name: string) => void;
}

type AfterBatchOutcome =
  | { phase: "done" }
  | { phase: "s2_pending"; instrumentId: string }
  | { phase: "collision"; pending: CollisionPending };

interface PreSurveyFlowModule {
  completeAfterBatch: (
    surveyId: string,
    phase: CollisionPhase,
    deps: CompleteAfterBatchDeps,
  ) => Promise<AfterBatchOutcome>;
  resolveCollisionFlow: (
    pending: CollisionPending,
    resolution: "same_person" | "separate_person",
    deps: {
      extractFarmer: (
        surveyId: string,
        resolution: "same_person" | "separate_person",
      ) => Promise<{ farmer: { id: string; name: string } }>;
      extractCrops: (surveyId: string) => Promise<unknown>;
      getInstrumentByCode: (code: string) => Promise<{ instrumentId: string }>;
      onFarmer: (farmerId: string, name: string) => void;
    },
  ) => Promise<{ phase: "done" } | { phase: "s2_pending"; instrumentId: string }>;
}

/** Fila de `GET /farmers/:id/discrepancies`. */
interface Discrepancy {
  discrepancyId: string;
  entityType: "farmer" | "farm" | "farmer_farm";
  farmerId: string | null;
  farmId: string | null;
  field: string;
  systemField: string | null;
  currentValue: unknown;
  submittedValue: unknown;
  surveyId: string;
  status: "open" | "applied" | "dismissed";
  createdAt: string;
}

interface DiscrepancySummaryItem {
  discrepancyId: string;
  entityLabel: string;
  fieldLabel: string;
  currentText: string;
  submittedText: string;
  surveyId: string;
}

interface DiscrepanciesModule {
  summarizeOpenDiscrepancies: (items: Discrepancy[]) => DiscrepancySummaryItem[];
}

interface ProcessBodyWithRole {
  farm: { mode: "create" | "link"; farmId?: string };
  townId?: string;
  resolution?: "same_person" | "separate_person";
  role?: FarmRole;
}

/** Respuesta de `process-public` con los campos aditivos de la extracción unificada. */
interface ProcessPublicResult {
  farmer: { id: string; name: string };
  existed: boolean;
  farm: { farmId: string; name: string } | null;
  farmCrops: { farmCropId: string; cropId: string; name: string }[];
  role: FarmRole | null;
}

interface ProcessPreviewModule {
  buildProcessBody: (input: {
    townId?: string;
    resolution?: "same_person" | "separate_person";
    farmMode?: "create" | "link";
    farmId?: string;
    role?: string;
  }) => ProcessBodyWithRole;
  describePreview: (preview: unknown) => { defaultRole: FarmRole; canProcess: boolean };
  describeProcessResult: (result: ProcessPublicResult) => {
    farmerHref: string;
    farmName: string | null;
    cropNames: string[];
    roleLabel: string | null;
  };
}

const loadPreSurveyFlow = () => loadModule<PreSurveyFlowModule>(PRE_SURVEY_FLOW);
const loadDiscrepancies = () => loadModule<DiscrepanciesModule>(DISCREPANCIES);
const loadProcessPreview = () => loadModule<ProcessPreviewModule>(PROCESS_PREVIEW);

// ─── datos ──────────────────────────────────────────────────────────────────

const FARMER_ID = "950000aa-0000-4000-8000-000000000001";
const OTHER_FARMER_ID = "950000aa-0000-4000-8000-000000000002";
const FARM_A = "950000bb-0000-4000-8000-00000000000a";
const SURVEY_ID = "950000cc-0000-4000-8000-000000000001";

function extraction(overrides: Partial<SurveyExtraction> = {}): SurveyExtraction {
  return {
    status: "done",
    farmerId: FARMER_ID,
    farmerName: "Rosalba TEST95",
    existed: false,
    clientFarmerId: null,
    farm: { farmId: FARM_A, name: "La Esperanza TEST95" },
    farmCropId: "fc-1",
    crops: [{ cropId: "crop-cacao", name: "Cacao" }],
    openDiscrepancies: 0,
    extractedAt: "2026-10-14T12:00:00.000Z",
    ...overrides,
  };
}

const collisionExtraction = (): SurveyExtraction =>
  extraction({
    status: "collision",
    farmerId: null,
    farmerName: null,
    existed: null,
    farm: null,
    farmCropId: null,
    crops: [],
    collision: {
      documentId: "9000950001",
      submittedName: "Rosalba Nueva TEST95",
      existingFarmer: { farmerId: OTHER_FARMER_ID, name: "Rosalba Existente TEST95" },
    },
  });

// ─── orquestador web sin extract-* ──────────────────────────────────────────

describe("completeAfterBatch — pre-encuesta web consume GET /surveys/:id/extraction", () => {
  function deps(result: SurveyExtraction) {
    return {
      getExtraction: vi.fn(async (surveyId: string) => ({ ...result, surveyId })),
      getInstrumentByCode: vi.fn(async (code: string) => ({ instrumentId: `id-${code}` })),
      onFarmer: vi.fn(),
      // Disponibles en la página, pero el flujo nuevo NO debe usarlos.
      extractFarmer: vi.fn(async () => ({ farmer: { id: FARMER_ID, name: "x" } })),
      extractCrops: vi.fn(async () => ({ crops: [] })),
    };
  }

  it("Registro: lee la extracción del batch, marca el productor con farmerName y termina sin extract-*", async () => {
    const mod = await loadPreSurveyFlow();
    const d = deps(extraction());

    await expect(
      exported(mod, "completeAfterBatch", PRE_SURVEY_FLOW)(SURVEY_ID, "registro_pending", d),
    ).resolves.toEqual({ phase: "done" });

    expect(d.getExtraction).toHaveBeenCalledWith(SURVEY_ID);
    expect(d.onFarmer).toHaveBeenCalledWith(FARMER_ID, "Rosalba TEST95");
    expect(d.extractFarmer).not.toHaveBeenCalled();
    expect(d.extractCrops).not.toHaveBeenCalled();
    expect(d.getInstrumentByCode).not.toHaveBeenCalled();
  });

  it("S1 legado: con el productor extraído sigue con S2, sin extract-*", async () => {
    const mod = await loadPreSurveyFlow();
    const d = deps(extraction({ existed: true }));

    await expect(
      exported(mod, "completeAfterBatch", PRE_SURVEY_FLOW)(SURVEY_ID, "s1_pending", d),
    ).resolves.toEqual({ phase: "s2_pending", instrumentId: "id-S2" });
    expect(d.onFarmer).toHaveBeenCalledWith(FARMER_ID, "Rosalba TEST95");
    expect(d.extractFarmer).not.toHaveBeenCalled();
    expect(d.extractCrops).not.toHaveBeenCalled();
  });

  it("backfilled se trata como done", async () => {
    const mod = await loadPreSurveyFlow();
    const d = deps(extraction({ status: "backfilled", existed: true }));

    await expect(
      exported(mod, "completeAfterBatch", PRE_SURVEY_FLOW)(SURVEY_ID, "registro_pending", d),
    ).resolves.toEqual({ phase: "done" });
    expect(d.onFarmer).toHaveBeenCalledWith(FARMER_ID, "Rosalba TEST95");
    expect(d.extractFarmer).not.toHaveBeenCalled();
    expect(d.extractCrops).not.toHaveBeenCalled();
  });

  it("not_applicable avanza sin productor nuevo", async () => {
    const mod = await loadPreSurveyFlow();
    const d = deps(
      extraction({
        status: "not_applicable",
        farmerId: null,
        farmerName: null,
        existed: null,
        farm: null,
        farmCropId: null,
        crops: [],
      }),
    );

    await expect(
      exported(mod, "completeAfterBatch", PRE_SURVEY_FLOW)(SURVEY_ID, "registro_pending", d),
    ).resolves.toEqual({ phase: "done" });
    expect(d.onFarmer).not.toHaveBeenCalled();
    expect(d.extractFarmer).not.toHaveBeenCalled();
    expect(d.extractCrops).not.toHaveBeenCalled();
  });

  it("colisión: devuelve el aviso pendiente con los nombres, sin marcar productor", async () => {
    const mod = await loadPreSurveyFlow();
    const d = deps(collisionExtraction());

    await expect(
      exported(mod, "completeAfterBatch", PRE_SURVEY_FLOW)(SURVEY_ID, "registro_pending", d),
    ).resolves.toEqual({
      phase: "collision",
      pending: {
        surveyId: SURVEY_ID,
        submittedName: "Rosalba Nueva TEST95",
        existingFarmerName: "Rosalba Existente TEST95",
        phase: "registro_pending",
      },
    });
    expect(d.onFarmer).not.toHaveBeenCalled();
    expect(d.extractFarmer).not.toHaveBeenCalled();
    expect(d.extractCrops).not.toHaveBeenCalled();
  });

  it("la colisión detectada así se resuelve con extract-farmer {resolution}", async () => {
    const mod = await loadPreSurveyFlow();
    const d = deps(collisionExtraction());
    const outcome = await exported(mod, "completeAfterBatch", PRE_SURVEY_FLOW)(
      SURVEY_ID,
      "registro_pending",
      d,
    );
    if (outcome.phase !== "collision") throw new Error(`se esperaba colisión, llegó ${outcome.phase}`);

    const extractFarmer = vi.fn(async () => ({
      farmer: { id: OTHER_FARMER_ID, name: "Rosalba Existente TEST95" },
    }));
    await exported(mod, "resolveCollisionFlow", PRE_SURVEY_FLOW)(outcome.pending, "same_person", {
      extractFarmer,
      extractCrops: vi.fn(async () => ({ crops: [] })),
      getInstrumentByCode: d.getInstrumentByCode,
      onFarmer: d.onFarmer,
    });
    expect(extractFarmer).toHaveBeenCalledWith(SURVEY_ID, "same_person");
    expect(d.onFarmer).toHaveBeenCalledWith(OTHER_FARMER_ID, "Rosalba Existente TEST95");
  });

  it.each(["error", "no_identity", "pending_alias"] as const)(
    "estado %s: rechaza con un mensaje en español, no avanza ni llama a extract-*",
    async (status) => {
      const mod = await loadPreSurveyFlow();
      const d = deps(
        extraction({ status, farmerId: null, farmerName: null, farm: null, crops: [] }),
      );

      const run = exported(mod, "completeAfterBatch", PRE_SURVEY_FLOW)(SURVEY_ID, "registro_pending", d);
      await expect(run).rejects.toBeInstanceOf(Error);
      await run.catch((err: Error) => {
        expect(err.message.length).toBeGreaterThan(0);
        expect(err.message).not.toMatch(/_/);
      });
      expect(d.onFarmer).not.toHaveBeenCalled();
      expect(d.getInstrumentByCode).not.toHaveBeenCalled();
      expect(d.extractFarmer).not.toHaveBeenCalled();
      expect(d.extractCrops).not.toHaveBeenCalled();
    },
  );

  it("si GET /extraction falla, propaga el error sin recurrir a extract-*", async () => {
    const mod = await loadPreSurveyFlow();
    const d = deps(extraction());
    const boom = new Error("red caída");
    d.getExtraction.mockRejectedValueOnce(boom);

    await expect(
      exported(mod, "completeAfterBatch", PRE_SURVEY_FLOW)(SURVEY_ID, "registro_pending", d),
    ).rejects.toBe(boom);
    expect(d.extractFarmer).not.toHaveBeenCalled();
    expect(d.extractCrops).not.toHaveBeenCalled();
  });
});

// ─── discrepancias abiertas en la ficha (solo lectura, D-H3-6) ──────────────

describe("summarizeOpenDiscrepancies — discrepancias en la ficha", () => {
  function discrepancy(overrides: Partial<Discrepancy> & Pick<Discrepancy, "discrepancyId">): Discrepancy {
    return {
      entityType: "farm",
      farmerId: FARMER_ID,
      farmId: FARM_A,
      field: "name",
      systemField: "farm.name",
      currentValue: "La Esperanza TEST95",
      submittedValue: "Esperanza Vieja TEST95",
      surveyId: SURVEY_ID,
      status: "open",
      createdAt: "2026-10-14T10:00:00.000Z",
      ...overrides,
    };
  }

  const items: Discrepancy[] = [
    discrepancy({ discrepancyId: "d-old" }),
    discrepancy({
      discrepancyId: "d-new",
      entityType: "farmer",
      farmId: null,
      field: "phone",
      systemField: "farmer.phone",
      currentValue: "3000000000",
      submittedValue: "3111111111",
      createdAt: "2026-10-14T11:00:00.000Z",
    }),
    discrepancy({ discrepancyId: "d-applied", status: "applied" }),
    discrepancy({ discrepancyId: "d-dismissed", status: "dismissed" }),
    discrepancy({
      discrepancyId: "d-null",
      field: "altitude",
      systemField: "farm.altitude",
      currentValue: 1650,
      submittedValue: null,
      createdAt: "2026-10-14T09:00:00.000Z",
    }),
  ];

  it("solo lista las abiertas, las más recientes primero", async () => {
    const mod = await loadDiscrepancies();
    const summary = exported(mod, "summarizeOpenDiscrepancies", DISCREPANCIES)(items);
    expect(summary.map((d) => d.discrepancyId)).toEqual(["d-new", "d-old", "d-null"]);
  });

  it("nombra la entidad y el campo en español, sin snake_case", async () => {
    const mod = await loadDiscrepancies();
    const summary = exported(mod, "summarizeOpenDiscrepancies", DISCREPANCIES)(items);
    const byId = new Map(summary.map((d) => [d.discrepancyId, d]));
    expect(byId.get("d-new")?.entityLabel).toBe("Productor");
    expect(byId.get("d-old")?.entityLabel).toBe("Finca");
    expect(byId.get("d-old")?.fieldLabel.toLowerCase()).toContain("nombre");
    for (const d of summary) {
      expect(d.fieldLabel.length).toBeGreaterThan(0);
      expect(d.fieldLabel).not.toMatch(/[_.]/);
      expect(d.entityLabel).not.toMatch(/_/);
    }
  });

  it("muestra el valor actual y el enviado como texto, con guion si falta", async () => {
    const mod = await loadDiscrepancies();
    const summary = exported(mod, "summarizeOpenDiscrepancies", DISCREPANCIES)(items);
    const old = summary.find((d) => d.discrepancyId === "d-old");
    expect(old?.currentText).toBe("La Esperanza TEST95");
    expect(old?.submittedText).toBe("Esperanza Vieja TEST95");
    const withNull = summary.find((d) => d.discrepancyId === "d-null");
    expect(withNull?.currentText).toBe("1650");
    expect(withNull?.submittedText).toBe("—");
    expect(withNull?.surveyId).toBe(SURVEY_ID);
  });

  it("el vínculo productor-finca también tiene una etiqueta legible", async () => {
    const mod = await loadDiscrepancies();
    const summary = exported(mod, "summarizeOpenDiscrepancies", DISCREPANCIES)([
      discrepancy({ discrepancyId: "d-link", entityType: "farmer_farm", field: "role", systemField: null }),
    ]);
    expect(summary).toHaveLength(1);
    expect(summary[0].entityLabel).not.toMatch(/_/);
    expect(summary[0].entityLabel.length).toBeGreaterThan(0);
  });
});

// ─── bandeja pública — selector de rol y resultado ──────────────────────────

describe("processPreview — rol al vincular finca y resultado del procesado", () => {
  it("vincular con rol envía el rol a process-public", async () => {
    const mod = await loadProcessPreview();
    expect(
      exported(mod, "buildProcessBody", PROCESS_PREVIEW)({
        farmMode: "link",
        farmId: FARM_A,
        role: "manager",
      }),
    ).toEqual({ farm: { mode: "link", farmId: FARM_A }, role: "manager" });
  });

  it("sin rol elegido no envía role (el backend usa producer)", async () => {
    const mod = await loadProcessPreview();
    const body = exported(mod, "buildProcessBody", PROCESS_PREVIEW)({ farmMode: "link", farmId: FARM_A });
    expect(body).not.toHaveProperty("role");
  });

  it("rechaza un rol fuera del catálogo", async () => {
    const mod = await loadProcessPreview();
    expect(() =>
      exported(mod, "buildProcessBody", PROCESS_PREVIEW)({ farmMode: "link", farmId: FARM_A, role: "jefe" }),
    ).toThrow();
  });

  it("la vista previa propone producer como rol por defecto", async () => {
    const mod = await loadProcessPreview();
    const d = exported(mod, "describePreview", PROCESS_PREVIEW)({
      surveyId: SURVEY_ID,
      identity: { name: "Spec95", documentId: "9000950002", phone: null },
      document: { status: "new", farmerId: null, candidates: [] },
      farm: { action: "create", farmId: null, sharedCandidates: [] },
      crops: { resolved: [], unmapped: [] },
      fieldsToComplete: [],
      warnings: [],
    });
    expect(d.defaultRole).toBe("producer");
  });

  it("el resultado muestra la finca, sus cultivos y el rol en español", async () => {
    const mod = await loadProcessPreview();
    const r = exported(mod, "describeProcessResult", PROCESS_PREVIEW)({
      farmer: { id: FARMER_ID, name: "Rosalba TEST95" },
      existed: false,
      farm: { farmId: FARM_A, name: "La Esperanza TEST95" },
      farmCrops: [
        { farmCropId: "fc-1", cropId: "crop-cacao", name: "Cacao" },
        { farmCropId: "fc-2", cropId: "crop-cafe", name: "Café" },
      ],
      role: "owner",
    });
    expect(r.farmerHref).toBe(`/admin/farmers/${FARMER_ID}`);
    expect(r.farmName).toBe("La Esperanza TEST95");
    expect(r.cropNames).toEqual(["Cacao", "Café"]);
    expect(r.roleLabel).toBe("Propietario");
  });
});
