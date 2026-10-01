import { apiClient } from "@/lib/apiClient";
import type { SignedMediaUrl } from "@/lib/media/mediaSignedUrl";

/**
 * Spec 85 (Fase 4): la evidencia multimedia ya no se sirve por una URL pública
 * permanente; se pide una URL firmada de vida corta bajo demanda.
 */
export function getMediaDownloadUrl(
  attachmentId: string,
): Promise<SignedMediaUrl> {
  return apiClient.get<SignedMediaUrl>(
    `/api/media-attachments/${attachmentId}/download-url`,
    { cache: "no-store" },
  );
}
