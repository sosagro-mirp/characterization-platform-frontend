import { apiClient } from "@/lib/apiClient";

export interface DepartmentSummary {
  departmentId: string;
  name: string;
}

export function listDepartments(): Promise<DepartmentSummary[]> {
  return apiClient.get<DepartmentSummary[]>("/api/departments");
}
