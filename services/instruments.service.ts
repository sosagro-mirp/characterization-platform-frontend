import { apiClient } from "@/lib/apiClient";
import {
  CreateInstrumentRequest,
  InstrumentDetail,
  InstrumentListItem,
  UpdateInstrumentRequest,
} from "@/app/(admin)/types";

export function getInstrumentByCode(
  code: string,
): Promise<{ instrumentId: string; name: string }> {
  return apiClient.get<{ instrumentId: string; name: string }>(
    `/api/instruments/by-code/${encodeURIComponent(code)}`,
    { cache: "no-store" },
  );
}

export function getInstruments(
  options?: { excludeSystem?: boolean },
): Promise<InstrumentListItem[]> {
  const url = options?.excludeSystem
    ? "/api/instruments?excludeSystem=true"
    : "/api/instruments";
  return apiClient.get<InstrumentListItem[]>(url, { cache: "no-store" });
}

export function getInstrumentById(id: string): Promise<InstrumentDetail> {
  return apiClient.get<InstrumentDetail>(`/api/instruments/${id}`, {
    cache: "no-store",
  });
}

export function createInstrument(
  data: CreateInstrumentRequest,
): Promise<InstrumentListItem> {
  return apiClient.post<InstrumentListItem>("/api/instruments", data);
}

export function updateInstrument(
  id: string,
  data: UpdateInstrumentRequest,
): Promise<InstrumentListItem> {
  return apiClient.patch<InstrumentListItem>(`/api/instruments/${id}`, data);
}

export function deleteInstrument(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/instruments/${id}`);
}

interface RenderedSection {
  sectionId: string;
  name: string;
  order: number;
  questions: import("@/app/(admin)/types").QuestionDetail[];
}

export async function getInstrumentForEditor(id: string): Promise<{
  instrumentId: string;
  name: string;
  version: number;
  publishDate: string;
  isActive: boolean;
  actorTypes: import("@/app/(admin)/types").ActorTypeSummary[];
  sections: import("@/app/(admin)/types").SectionDetail[];
}> {
  const [meta, render] = await Promise.all([
    getInstrumentById(id),
    apiClient.get<{ sections?: RenderedSection[] }>(
      `/api/instruments/${id}/render`,
      { cache: "no-store" },
    ),
  ]);

  return {
    instrumentId: meta.instrumentId,
    name: meta.name,
    version: meta.version,
    publishDate: meta.publishDate,
    isActive: meta.isActive,
    actorTypes: meta.actorTypes ?? [],
    sections: (render.sections ?? []).map((sec) => ({
      sectionId: sec.sectionId,
      name: sec.name,
      order: sec.order,
      createdAt: "",
      updatedAt: "",
      questions: sec.questions ?? [],
    })),
  };
}
