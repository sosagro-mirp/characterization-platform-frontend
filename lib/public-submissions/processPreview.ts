/**
 * Spec 93, Fase 4 — lógica pura de la bandeja de envíos públicos: lectura de
 * la vista previa de `GET /api/surveys/:id/process-preview` y construcción del
 * cuerpo de `POST /api/surveys/:id/process-public`.
 */

export type DocumentStatus = "new" | "same_person_match" | "collision";
export type FarmMode = "create" | "link";
export type CollisionResolution = "same_person" | "separate_person";

export interface ProcessPreview {
  surveyId: string;
  identity: {
    name: string | null;
    documentId: string | null;
    phone: string | null;
  };
  document: {
    status: DocumentStatus;
    farmerId: string | null;
    candidates: { farmerId: string; name: string }[];
  };
  farm: {
    action: "create" | "link" | "complete" | "none";
    farmId: string | null;
    sharedCandidates: {
      source: "farm" | "pending_submission";
      farmId: string | null;
      surveyId: string | null;
      name: string;
      vereda: string | null;
    }[];
  };
  crops: {
    resolved: { cropId: string; name: string }[];
    unmapped: string[];
  };
  fieldsToComplete: {
    entity: "farmer" | "farm";
    field: string;
    value: unknown;
  }[];
  warnings: { code: string; message?: string }[];
}

export interface PreviewWarning {
  code: string;
  message: string;
  /** Detalle del backend (campo recortado, área original, etc.), si aporta algo. */
  detail?: string;
}

export type FarmAction = ProcessPreview["farm"]["action"];

export interface PreviewDescription {
  outcome: "new_farmer" | "existing_farmer";
  farmerHref: string | null;
  canProcess: boolean;
  requiresResolution: boolean;
  requiresTown: boolean;
  defaultFarmMode: FarmMode;
  /** Qué hará el backend con la finca (`farm.action`). */
  farmAction: FarmAction;
  /** Solo con `create` hay algo que elegir (crear o vincular). */
  farmChoiceRequired: boolean;
  /** Finca a la que se vinculará cuando el backend ya anuncia `link`. */
  linkedFarm: { farmId: string; name: string | null } | null;
  farmCandidates: ProcessPreview["farm"]["sharedCandidates"];
  crops: string[];
  unmappedCrops: string[];
  fieldsToComplete: string[];
  warnings: PreviewWarning[];
}

const WARNING_MESSAGES: Record<string, string> = {
  respondent_not_producer:
    "Quien respondió no es el productor (perfil declarado: extensionista, técnico u otro rol). El taller no distingue esa persona del productor: si procesas este envío, quedará registrada como productora la persona que respondió. Lo indicado es dejarlo pendiente hasta revisarlo caso a caso.",
  missing_town:
    "El envío no trae el municipio de la finca. Elígelo para poder procesarlo.",
  area_converted: "El área de la finca se convirtió a hectáreas.",
  area_unit_unknown:
    "La unidad del área no se reconoce; el área no se guardará.",
  multi_value_truncated:
    "Había varias opciones en un campo de valor único; solo se conservó una parte.",
  different_farm_name_existing_farmer:
    "El productor ya tiene una finca con otro nombre; no se creará una segunda y este dato queda solo como respuesta.",
  duplicate_document_in_pending:
    "Hay otro envío pendiente con este mismo documento.",
};

function describeWarning(code: string, message?: string): PreviewWarning {
  const usable = message && !message.includes("_") ? message : undefined;
  const known = WARNING_MESSAGES[code];
  if (known) {
    return {
      code,
      message: known,
      ...(usable && usable !== known ? { detail: usable } : {}),
    };
  }
  return {
    code,
    message:
      usable ?? "Advertencia sin descripción; revisa las respuestas del envío.",
  };
}

export function describePreview(preview: ProcessPreview): PreviewDescription {
  const isExisting = preview.document.status === "same_person_match";
  const requiresTown = preview.warnings.some((w) => w.code === "missing_town");
  return {
    outcome: isExisting ? "existing_farmer" : "new_farmer",
    farmerHref:
      isExisting && preview.document.farmerId
        ? `/admin/farmers/${preview.document.farmerId}`
        : null,
    canProcess: !requiresTown,
    requiresResolution: preview.document.status === "collision",
    requiresTown,
    defaultFarmMode: "create",
    farmAction: preview.farm.action,
    farmChoiceRequired: preview.farm.action === "create",
    linkedFarm:
      preview.farm.action === "link" && preview.farm.farmId
        ? {
            farmId: preview.farm.farmId,
            name:
              preview.farm.sharedCandidates.find(
                (c) => c.farmId === preview.farm.farmId,
              )?.name ?? null,
          }
        : null,
    farmCandidates: preview.farm.sharedCandidates,
    crops: preview.crops.resolved.map((c) => c.name),
    unmappedCrops: preview.crops.unmapped,
    fieldsToComplete: preview.fieldsToComplete.map(
      (f) => `${f.entity}.${f.field}`,
    ),
    warnings: preview.warnings.map((w) => describeWarning(w.code, w.message)),
  };
}

export interface ProcessBody {
  farm: { mode: FarmMode; farmId?: string };
  townId?: string;
  resolution?: CollisionResolution;
}

export function buildProcessBody(input: {
  townId?: string;
  resolution?: CollisionResolution;
  farmMode?: FarmMode;
  farmId?: string;
}): ProcessBody {
  const mode = input.farmMode ?? "create";
  if (mode === "link" && !input.farmId) {
    throw new Error("Elige la finca a la que se vinculará el envío.");
  }
  const body: ProcessBody = {
    farm: mode === "link" ? { mode, farmId: input.farmId } : { mode },
  };
  if (input.townId) body.townId = input.townId;
  if (input.resolution) body.resolution = input.resolution;
  return body;
}

/** Motivo por el que "Crear agricultor" está deshabilitado, o `null` si no falta nada. */
export function describeBlockReason(input: {
  hasPreview: boolean;
  loading: boolean;
  requiresTown: boolean;
  townId?: string;
  farmChoiceRequired: boolean;
  farmMode: FarmMode;
  farmId?: string;
}): string | null {
  if (!input.hasPreview || input.loading) {
    return "Espera a que termine de cargar la vista previa.";
  }
  if (input.requiresTown && !input.townId) {
    return "Elige el municipio de la finca para poder crear el agricultor.";
  }
  if (input.farmChoiceRequired && input.farmMode === "link" && !input.farmId) {
    return "Elige la finca existente a la que se vinculará el envío.";
  }
  return null;
}
