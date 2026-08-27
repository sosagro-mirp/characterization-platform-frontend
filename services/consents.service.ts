import { apiClient } from "@/lib/apiClient";
import type { ConsentPayload } from "@/lib/consents/consentSubmission";
import type { ConsentStatus } from "@/lib/consents/resolveConsentRequirement";

export interface ConsentDocument {
  consentDocumentId: string;
  version: string;
  title: string;
  body: string;
  dataProcessingClause: string;
  multimediaClause: string;
  rightsClause: string;
  responsibleEntity: string;
  contactEmail: string;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentRecord {
  consentRecordId: string;
  consentDocument: ConsentDocument;
  acceptedDataProcessing: boolean;
  acceptedPhoto: boolean;
  acceptedAudio: boolean;
  acceptedVideo: boolean;
  acceptedFollowUpContact: boolean;
  respondentName: string | null;
  acceptedAt: string;
  revokedAt: string | null;
  revokedReason: string | null;
}

export function getActiveConsentDocument(): Promise<ConsentDocument> {
  return apiClient.get<ConsentDocument>("/api/consent-documents/active", {
    cache: "no-store",
  });
}

/**
 * `404` (nunca consintió) se traduce a `status: "none"` en vez de propagar el
 * error: es el caso normal de un encuestado nuevo o de uno que aún no tiene
 * ninguna constancia, no una falla de red.
 */
export async function getFarmerConsentStatus(farmerId: string): Promise<ConsentStatus> {
  try {
    return await apiClient.get<ConsentStatus>(`/api/farmers/${farmerId}/consent`, {
      cache: "no-store",
    });
  } catch {
    return { status: "none", acceptedVersion: null };
  }
}

export function submitConsent(payload: ConsentPayload): Promise<ConsentRecord> {
  return apiClient.post<ConsentRecord>("/api/consents", payload);
}

export function listConsentDocuments(): Promise<ConsentDocument[]> {
  return apiClient.get<ConsentDocument[]>("/api/consent-documents", {
    cache: "no-store",
  });
}

export function getConsentDocument(id: string): Promise<ConsentDocument> {
  return apiClient.get<ConsentDocument>(`/api/consent-documents/${id}`, {
    cache: "no-store",
  });
}

export interface CreateConsentDocumentPayload {
  version: string;
  title: string;
  body: string;
  dataProcessingClause: string;
  multimediaClause: string;
  rightsClause: string;
  responsibleEntity: string;
  contactEmail: string;
}

export function createConsentDocument(
  data: CreateConsentDocumentPayload,
): Promise<ConsentDocument> {
  return apiClient.post<ConsentDocument>("/api/consent-documents", data);
}

export function updateConsentDocument(
  id: string,
  data: Partial<CreateConsentDocumentPayload>,
): Promise<ConsentDocument> {
  return apiClient.patch<ConsentDocument>(`/api/consent-documents/${id}`, data);
}

export function publishConsentDocument(id: string): Promise<ConsentDocument> {
  return apiClient.post<ConsentDocument>(`/api/consent-documents/${id}/publish`, {});
}

export function listConsentRecords(filters?: {
  farmerId?: string;
  sessionId?: string;
  consentDocumentId?: string;
}): Promise<ConsentRecord[]> {
  const params = new URLSearchParams();
  if (filters?.farmerId) params.set("farmerId", filters.farmerId);
  if (filters?.sessionId) params.set("sessionId", filters.sessionId);
  if (filters?.consentDocumentId) params.set("consentDocumentId", filters.consentDocumentId);
  const qs = params.toString();
  return apiClient.get<ConsentRecord[]>(`/api/consents${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
}

export function revokeConsentRecord(id: string, reason: string): Promise<{ revoked: true }> {
  return apiClient.post<{ revoked: true }>(`/api/consents/${id}/revoke`, { reason });
}
