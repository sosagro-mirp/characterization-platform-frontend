import { beforeEach, describe, expect, it, vi } from "vitest";

const patch = vi.fn();
vi.mock("@/lib/apiClient", () => ({ apiClient: { patch: (...a: unknown[]) => patch(...a) } }));

import { updateBuilderChart } from "./dashboard-builder.service";

describe("updateBuilderChart", () => {
  beforeEach(() => patch.mockReset().mockResolvedValue({}));

  it("no envía sourceKind: el backend lo rechaza al editar", async () => {
    await updateBuilderChart("abc", {
      title: "T",
      sourceKind: "questions",
      audience: "private",
    });
    const body = patch.mock.calls[0][1];
    expect(body).toEqual({ title: "T", audience: "private" });
    expect("sourceKind" in body).toBe(false);
  });
});
