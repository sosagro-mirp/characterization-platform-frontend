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
}

export interface PreviewDescription {
  outcome: "new_farmer" | "existing_farmer";
  farmerHref: string | null;
  canProcess: boolean;
  requiresResolution: boolean;
  requiresTown: boolean;
  defaultFarmMode: FarmMode;
  farmCandidates: ProcessPreview["farm"]["sharedCandidates"];
  crops: string[];
  unmappedCrops: string[];
  fieldsToComplete: string[];
  warnings: PreviewWarning[];
}

const WARNING_MESSAGES: Record<string, string> = {
  respondent_not_producer:
    "La persona que respondió indicó que no es la productora; se usarán los datos del productor declarado.",
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

function warningMessage(code: string, message?: string): string {
  const known = WARNING_MESSAGES[code];
  if (known) return known;
  if (message && !message.includes("_")) return message;
  return "Advertencia sin descripción; revisa las respuestas del envío.";
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
    farmCandidates: preview.farm.sharedCandidates,
    crops: preview.crops.resolved.map((c) => c.name),
    unmappedCrops: preview.crops.unmapped,
    fieldsToComplete: preview.fieldsToComplete.map(
      (f) => `${f.entity}.${f.field}`,
    ),
    warnings: preview.warnings.map((w) => ({
      code: w.code,
      message: warningMessage(w.code, w.message),
    })),
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
