import { apiClient } from "@/lib/apiClient";
import {
  CreateSectionRequest,
  SectionSummary,
  UpdateSectionRequest,
} from "@/app/(admin)/types";

export function getSections(instrumentId: string): Promise<SectionSummary[]> {
  return apiClient.get<SectionSummary[]>(
    `/api/instruments/${instrumentId}/sections`,
    { cache: "no-store" },
  );
}

export function createSection(
  instrumentId: string,
  data: CreateSectionRequest,
): Promise<SectionSummary> {
  return apiClient.post<SectionSummary>(
    `/api/instruments/${instrumentId}/sections`,
    data,
  );
}

export function updateSection(
  instrumentId: string,
  sectionId: string,
  data: UpdateSectionRequest,
): Promise<SectionSummary> {
  return apiClient.patch<SectionSummary>(
    `/api/instruments/${instrumentId}/sections/${sectionId}`,
    data,
  );
}

export function deleteSection(
  instrumentId: string,
  sectionId: string,
): Promise<void> {
  return apiClient.delete<void>(
    `/api/instruments/${instrumentId}/sections/${sectionId}`,
  );
}
