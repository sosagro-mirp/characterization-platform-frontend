import type { FarmerDeletionPreview } from "@/app/(admin)/types";

export type { FarmerDeletionPreview };

/**
 * Spec 73 — criterio 11: el botón destructivo del diálogo de eliminación solo
 * se habilita cuando el texto escrito coincide exactamente con el documento
 * del agricultor (o su nombre, si no tiene documento). Tolera espacios
 * sobrantes al inicio/final; no distingue mayúsculas al comparar contra el
 * nombre (el documento sí, aunque en la práctica es solo dígitos).
 */
export function isDeletionConfirmed(
  input: string,
  preview: Pick<FarmerDeletionPreview, "documentId" | "name">,
): boolean {
  const typed = input.trim();
  if (!typed) return false;

  if (preview.documentId) {
    return typed === preview.documentId;
  }

  return typed.toLowerCase() === preview.name.trim().toLowerCase();
}

/**
 * Spec 73 — criterio 10: enumera en español lo que el inventario de borrado
 * contiene, omitiendo los conteos en cero para no inflar el diálogo con
 * líneas vacías.
 */
export function summarizeDeletionPreview(
  preview: FarmerDeletionPreview,
): string[] {
  const lines: string[] = [];
  const { counts, farm, preserved } = preview;

  if (counts.campaignSessions > 0) {
    lines.push(pluralLine(counts.campaignSessions, "sesión de campaña", "sesiones de campaña"));
  }
  if (counts.surveys > 0) {
    lines.push(pluralLine(counts.surveys, "encuesta", "encuestas"));
  }
  if (counts.responses > 0) {
    lines.push(pluralLine(counts.responses, "respuesta", "respuestas"));
  }
  if (counts.documentCollisions > 0) {
    lines.push(
      pluralLine(
        counts.documentCollisions,
        "colisión de documento registrada",
        "colisiones de documento registradas",
      ),
    );
  }
  if (counts.relations > 0) {
    lines.push(
      pluralLine(counts.relations, "relación asociada (tecnologías, obstáculos, conexiones)", "relaciones asociadas (tecnologías, obstáculos, conexiones)"),
    );
  }

  if (farm) {
    lines.push(
      farm.willBeDeleted
        ? `La finca "${farm.name}" se eliminará (no la comparte ningún otro agricultor).`
        : `La finca "${farm.name}" es compartida con otro agricultor: no se eliminará.`,
    );
  }

  if (preserved.changeRequests > 0) {
    lines.push(
      pluralLine(
        preserved.changeRequests,
        "solicitud de cambio quedará sin agricultor asociado (se conserva)",
        "solicitudes de cambio quedarán sin agricultor asociado (se conservan)",
      ),
    );
  }

  return lines;
}

function pluralLine(count: number, singular: string, plural: string): string {
  const noun = count === 1 ? singular : plural;
  return `${count} ${noun}`;
}
