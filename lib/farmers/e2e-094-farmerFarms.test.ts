/**
 * e2e-094 — Spec 94 «Modelo y backfill» (productor ↔ finca N:M con rol):
 * lógica pura del frontend.
 *
 * Escrito junto con el spec, antes de la implementación: arranca EN ROJO.
 * Cubre la parte web del modelo N:M: la ficha del agricultor muestra todas
 * sus fincas con su rol (principal primero), avisa al editar los cultivos de
 * una finca compartida, y el borrado en cascada (spec 73) enumera varias
 * fincas conservando las compartidas.
 *
 * Lo que depende de la extracción unificada (orquestador web sin `extract-*`,
 * discrepancias abiertas, bandeja pública con rol) quedó en el spec 95:
 * `lib/campaign-session/e2e-095-extractionFlow.test.ts`.
 *
 * El entorno de Vitest de este repositorio es `node` (sin Testing Library), así
 * que aquí solo se prueba lógica pura. Lo visual vive en el `test-094` manual.
 *
 * ── Por qué el import de `farmerFarms` es dinámico ─────────────────────────
 * `tsconfig.json` incluye `**\/*.ts`, así que un import estático de un módulo
 * que todavía no existe rompería el typecheck de todo el repositorio. Se carga
 * con `import()` sobre un especificador no literal y se tipa con el CONTRATO
 * que la implementación debe exponer (`FarmerFarmsModule`). Al implementar,
 * puede pasar a import estático sin cambiar las aserciones.
 *
 * ── Contrato que el spec 94 debe exponer (nombres propuestos) ──────────────
 *
 * 1. NUEVO `lib/farmers/farmerFarms.ts`
 *    - `FARM_ROLES`: catálogo D-H3-3 en orden
 *      `owner · producer · manager · worker · family · other`.
 *    - `DEFAULT_FARM_ROLE = "producer"`.
 *    - `farmRoleLabel(role)`: etiqueta en español (owner→Propietario,
 *      producer→Productor, manager→Administrador, worker→Trabajador,
 *      family→Familiar, other→Otro). Un rol desconocido cae en "Otro".
 *    - `FARM_ROLE_OPTIONS`: `{ value, label }[]` para el selector de rol.
 *    - `presentFarmerFarms(farms)`: `farms[]` de `GET /farmers/:id` listo para
 *      la ficha — principal primero, luego por nombre (es), con `roleLabel`,
 *      `isPrimary` y `cropNames`.
 *    - `primaryFarm(farms)`: la finca principal o `null`.
 *    - `sharedFarmCropsWarning(farm, currentFarmerId)`: aviso (string) al
 *      editar los cultivos de una finca que comparten otros productores
 *      (`farmers[]` de `GET /farms/:id`); `null` si no es compartida.
 *
 * 2. `lib/farmers/cascadeDeletion.ts` (spec 73 con N:M)
 *    - `FarmerDeletionPreview` gana `farms: FarmerDeletionFarmInfo[]` (se
 *      mantiene `farm`). `summarizeDeletionPreview` enumera cada finca: las
 *      compartidas se conservan y las demás se eliminan, sin repetir la
 *      principal.
 *
 * Si el backend fija otros nombres de campo, se ajustan aquí y en la
 * implementación en el mismo cambio.
 */
import { describe, expect, it } from "vitest";
import {
  summarizeDeletionPreview,
  type FarmerDeletionPreview,
} from "./cascadeDeletion";

// ─── carga dinámica del módulo bajo prueba ──────────────────────────────────

async function loadModule<T>(specifier: string): Promise<T> {
  return (await import(/* @vite-ignore */ specifier)) as T;
}

/** Devuelve la exportación pedida o falla con un mensaje claro si no existe. */
function exported<M, K extends keyof M>(mod: M, name: K, from: string): M[K] {
  const value = (mod as Record<PropertyKey, unknown>)[name];
  if (value === undefined) {
    throw new Error(
      `Spec 94 sin implementar: falta la exportación \`${String(name)}\` en \`${from}\`.`,
    );
  }
  return value as M[K];
}

const FARMER_FARMS = "./farmerFarms";

// ─── contrato esperado ──────────────────────────────────────────────────────

type FarmRole = "owner" | "producer" | "manager" | "worker" | "family" | "other";

/** Elemento de `farms[]` en `GET /farmers/:id` (Contrato de API del spec). */
interface FarmerFarm {
  farmId: string;
  name: string;
  vereda: string | null;
  town: { townId: string; name: string } | null;
  role: FarmRole;
  isPrimary: boolean;
  crops: { farmCropId: string; cropId: string; name: string }[];
}

interface PresentedFarm {
  farmId: string;
  name: string;
  roleLabel: string;
  isPrimary: boolean;
  cropNames: string[];
}

/** `GET /farms/:id` (solo lo que necesita el aviso de finca compartida). */
interface FarmWithFarmers {
  farmId: string;
  name: string;
  farmers: { farmerId: string; name: string; role: FarmRole; isPrimary: boolean }[];
}

interface FarmerFarmsModule {
  FARM_ROLES: readonly FarmRole[];
  DEFAULT_FARM_ROLE: FarmRole;
  FARM_ROLE_OPTIONS: readonly { value: FarmRole; label: string }[];
  farmRoleLabel: (role: string) => string;
  presentFarmerFarms: (farms: FarmerFarm[]) => PresentedFarm[];
  primaryFarm: (farms: FarmerFarm[]) => FarmerFarm | null;
  sharedFarmCropsWarning: (farm: FarmWithFarmers, currentFarmerId: string) => string | null;
}

const loadFarmerFarms = () => loadModule<FarmerFarmsModule>(FARMER_FARMS);

// ─── datos ──────────────────────────────────────────────────────────────────

const FARMER_ID = "940000aa-0000-4000-8000-000000000001";
const OTHER_FARMER_ID = "940000aa-0000-4000-8000-000000000002";
const FARM_A = "940000bb-0000-4000-8000-00000000000a";
const FARM_B = "940000bb-0000-4000-8000-00000000000b";
const FARM_C = "940000bb-0000-4000-8000-00000000000c";

function farm(overrides: Partial<FarmerFarm> & Pick<FarmerFarm, "farmId" | "name">): FarmerFarm {
  return {
    vereda: null,
    town: null,
    role: "producer",
    isPrimary: false,
    crops: [],
    ...overrides,
  };
}

const farms: FarmerFarm[] = [
  farm({ farmId: FARM_B, name: "Zeta TEST94", role: "worker" }),
  farm({
    farmId: FARM_A,
    name: "La Esperanza TEST94",
    role: "owner",
    isPrimary: true,
    crops: [
      { farmCropId: "fc-1", cropId: "crop-cacao", name: "Cacao" },
      { farmCropId: "fc-2", cropId: "crop-cafe", name: "Café" },
    ],
  }),
  farm({ farmId: FARM_C, name: "Alto Bonito TEST94", role: "family" }),
];

// ─── catálogo de roles ──────────────────────────────────────────────────────

describe("farmerFarms — catálogo de roles (D-H3-3)", () => {
  it("expone el catálogo completo con producer como rol por defecto", async () => {
    const mod = await loadFarmerFarms();
    expect([...exported(mod, "FARM_ROLES", FARMER_FARMS)]).toEqual([
      "owner",
      "producer",
      "manager",
      "worker",
      "family",
      "other",
    ]);
    expect(exported(mod, "DEFAULT_FARM_ROLE", FARMER_FARMS)).toBe("producer");
  });

  it("traduce cada rol al español", async () => {
    const mod = await loadFarmerFarms();
    const label = exported(mod, "farmRoleLabel", FARMER_FARMS);
    expect(label("owner")).toBe("Propietario");
    expect(label("producer")).toBe("Productor");
    expect(label("manager")).toBe("Administrador");
    expect(label("worker")).toBe("Trabajador");
    expect(label("family")).toBe("Familiar");
    expect(label("other")).toBe("Otro");
  });

  it("un rol desconocido no se muestra crudo: cae en Otro", async () => {
    const mod = await loadFarmerFarms();
    expect(exported(mod, "farmRoleLabel", FARMER_FARMS)("tenant_x")).toBe("Otro");
  });

  it("las opciones del selector cubren el catálogo con su etiqueta", async () => {
    const mod = await loadFarmerFarms();
    const options = exported(mod, "FARM_ROLE_OPTIONS", FARMER_FARMS);
    expect(options.map((o) => o.value)).toEqual([...mod.FARM_ROLES]);
    expect(options.find((o) => o.value === "manager")?.label).toBe("Administrador");
  });
});

// ─── ficha del agricultor: todas sus fincas con su rol ──────────────────────

describe("presentFarmerFarms — ficha del agricultor", () => {
  it("muestra todas las fincas, la principal primero y el resto por nombre", async () => {
    const mod = await loadFarmerFarms();
    const presented = exported(mod, "presentFarmerFarms", FARMER_FARMS)(farms);
    expect(presented.map((f) => f.farmId)).toEqual([FARM_A, FARM_C, FARM_B]);
    expect(presented[0].isPrimary).toBe(true);
    expect(presented.filter((f) => f.isPrimary)).toHaveLength(1);
  });

  it("cada finca lleva su rol en español y sus cultivos", async () => {
    const mod = await loadFarmerFarms();
    const presented = exported(mod, "presentFarmerFarms", FARMER_FARMS)(farms);
    expect(presented.map((f) => f.roleLabel)).toEqual(["Propietario", "Familiar", "Trabajador"]);
    expect(presented[0].cropNames).toEqual(["Cacao", "Café"]);
    expect(presented[1].cropNames).toEqual([]);
  });

  it("no muta el arreglo recibido", async () => {
    const mod = await loadFarmerFarms();
    const copy = farms.map((f) => f.farmId);
    exported(mod, "presentFarmerFarms", FARMER_FARMS)(farms);
    expect(farms.map((f) => f.farmId)).toEqual(copy);
  });

  it("sin fincas devuelve una lista vacía", async () => {
    const mod = await loadFarmerFarms();
    expect(exported(mod, "presentFarmerFarms", FARMER_FARMS)([])).toEqual([]);
  });

  it("primaryFarm devuelve la principal, o null si no hay", async () => {
    const mod = await loadFarmerFarms();
    const primary = exported(mod, "primaryFarm", FARMER_FARMS);
    expect(primary(farms)?.farmId).toBe(FARM_A);
    expect(primary(farms.filter((f) => !f.isPrimary))).toBeNull();
  });
});

describe("sharedFarmCropsWarning — editar cultivos de una finca compartida", () => {
  const shared: FarmWithFarmers = {
    farmId: FARM_A,
    name: "La Esperanza TEST94",
    farmers: [
      { farmerId: FARMER_ID, name: "Rosalba TEST94", role: "owner", isPrimary: true },
      { farmerId: OTHER_FARMER_ID, name: "Joaquín TEST94", role: "worker", isPrimary: false },
    ],
  };

  it("avisa cuando otro productor comparte la finca y lo nombra", async () => {
    const mod = await loadFarmerFarms();
    const warning = exported(mod, "sharedFarmCropsWarning", FARMER_FARMS)(shared, FARMER_ID);
    expect(warning).not.toBeNull();
    expect(warning).toContain("Joaquín TEST94");
    expect(warning).not.toContain("Rosalba TEST94");
  });

  it("no avisa si el único vinculado es el productor de la ficha", async () => {
    const mod = await loadFarmerFarms();
    const solo: FarmWithFarmers = { ...shared, farmers: [shared.farmers[0]] };
    expect(exported(mod, "sharedFarmCropsWarning", FARMER_FARMS)(solo, FARMER_ID)).toBeNull();
  });
});

// ─── spec 73 con N:M — borrado en cascada con varias fincas ─────────────────

describe("summarizeDeletionPreview — spec 73 con N:M", () => {
  type FarmInfo = NonNullable<FarmerDeletionPreview["farm"]>;
  type PreviewWithFarms = FarmerDeletionPreview & { farms: FarmInfo[] };

  const primary: FarmInfo = {
    farmId: FARM_A,
    name: "La Esperanza TEST94",
    shared: false,
    willBeDeleted: true,
  };
  const sharedFarm: FarmInfo = {
    farmId: FARM_B,
    name: "Zeta TEST94",
    shared: true,
    willBeDeleted: false,
  };

  const preview: PreviewWithFarms = {
    farmerId: FARMER_ID,
    name: "Rosalba TEST94",
    documentId: "9000940001",
    counts: {
      farms: 2,
      campaignSessions: 0,
      surveys: 1,
      responses: 10,
      documentCollisions: 0,
      relations: 0,
      consentRecords: 0,
    },
    farm: primary,
    farms: [primary, sharedFarm],
    preserved: { changeRequests: 0 },
  };

  it("enumera cada finca: la compartida se conserva y la propia se elimina", () => {
    const lines = summarizeDeletionPreview(preview);
    const shared = lines.filter((l) => l.includes("Zeta TEST94"));
    const own = lines.filter((l) => l.includes("La Esperanza TEST94"));
    expect(shared).toHaveLength(1);
    expect(shared[0]).toMatch(/no se eliminará/);
    expect(own).toHaveLength(1);
    expect(own[0]).toMatch(/se eliminará/);
    expect(own[0]).not.toMatch(/no se eliminará/);
  });

  it("la principal no se repite aunque venga en farm y en farms", () => {
    const lines = summarizeDeletionPreview(preview);
    expect(lines.filter((l) => l.includes("La Esperanza TEST94"))).toHaveLength(1);
  });
});
