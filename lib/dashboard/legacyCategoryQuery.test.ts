import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/lib/apiClient", () => ({ apiClient: { get: (...a: unknown[]) => get(...a) } }));

import {
  fetchDashboardAnalytics,
  fetchDashboardOverview,
  fetchDashboardSummary,
  fetchDepartmentCounts,
  fetchDigitalDemand,
  fetchKpis,
  fetchServedCharts,
} from "@/app/(dashboard)/api";

/**
 * Spec 109 (Fase 6): el backend responde 410 si `categoryId` llega a una ruta
 * de agregación. Ninguna de ellas debe reenviarlo; los gráficos sí lo llevan.
 */
describe("categoryId no llega a las rutas de agregación", () => {
  beforeEach(() => get.mockReset().mockResolvedValue({ charts: [] }));

  const filters = { categoryId: "C1", departmentId: "d-1" };

  it.each([
    ["analytics", fetchDashboardAnalytics],
    ["summary", fetchDashboardSummary],
    ["department-counts", fetchDepartmentCounts],
    ["overview", fetchDashboardOverview],
    ["kpis", fetchKpis],
    ["digital-demand", fetchDigitalDemand],
  ] as const)("/%s no envía categoryId", async (route, fetcher) => {
    await fetcher(filters);
    const url = get.mock.calls[0][0] as string;
    expect(url).toContain(`/api/dashboard/${route}`);
    expect(url).toContain("departmentId=d-1");
    expect(url).not.toContain("categoryId");
  });

  it("/charts sí lleva el código de la categoría", async () => {
    await fetchServedCharts("C1", filters);
    const url = get.mock.calls[0][0] as string;
    expect(url).toContain("categoryId=C1");
    expect(url.match(/categoryId=/g)).toHaveLength(1);
  });
});
