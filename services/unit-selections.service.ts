import { apiClient } from "@/lib/apiClient";
import type {
  CoverageColumn,
  SelectionStatus,
} from "@/lib/production-units/types";

// Spec 99 — solo ADMIN y RESEARCHER.

export interface SelectionState {
  farmId: string;
  status: SelectionStatus;
  reason: string;
  version: number;
  updatedAt: string;
}

export interface SelectionEvent {
  fromStatus: SelectionStatus | null;
  toStatus: SelectionStatus;
  reason: string;
  userName: string;
  createdAt: string;
  coverageSnapshot: (CoverageColumn & { cell: { status: string } })[] | null;
}

type Counts = Record<SelectionStatus, number>;

export interface SelectionSummary {
  target: number;
  total: Counts & { none: number };
  byCrop: ({ cropId: string; name: string } & Counts)[];
  byDepartment: ({ departmentId: string | null; name: string } & Counts)[];
}

export function setSelection(
  farmId: string,
  body: { status: SelectionStatus; reason: string; expectedVersion: number },
): Promise<SelectionState> {
  return apiClient.put<SelectionState>(`/api/unit-selections/${farmId}`, body);
}

export function getSelectionHistory(farmId: string): Promise<SelectionEvent[]> {
  return apiClient.get<SelectionEvent[]>(
    `/api/unit-selections/${farmId}/history`,
    { cache: "no-store" },
  );
}

export function getSelectionSummary(): Promise<SelectionSummary> {
  return apiClient.get<SelectionSummary>("/api/unit-selections/summary", {
    cache: "no-store",
  });
}

/** El libro trae siempre el resultado completo: el chip de la vista no lo filtra. */
export function exportSelection(): Promise<Blob> {
  return apiClient.post<Blob>(
    "/api/unit-selections/export",
    {},
    { blob: true },
  );
}
