/**
 * Bug `web-survey-sync`: la web debe marcar cada encuesta como sincronizada
 * después de enviar sus respuestas, igual que el móvil.
 */
import { describe, expect, it, vi } from "vitest";
import { submitAndSync } from "./submitAndSync";

const SURVEY = "11111111-1111-4111-8111-111111111111";

describe("submitAndSync", () => {
  it("envía el batch y después marca la encuesta como sincronizada", async () => {
    const calls: string[] = [];
    const submitBatch = vi.fn(async () => {
      calls.push("batch");
    });
    const markSynced = vi.fn(async () => {
      calls.push("sync");
    });

    const result = await submitAndSync({ submitBatch, markSynced }, SURVEY, [
      { a: 1 },
    ]);

    expect(result).toEqual({ synced: true });
    expect(calls).toEqual(["batch", "sync"]);
    expect(submitBatch).toHaveBeenCalledWith([{ a: 1 }]);
    expect(markSynced).toHaveBeenCalledWith(SURVEY);
  });

  it("si el batch falla, propaga el error y no marca la encuesta", async () => {
    const markSynced = vi.fn();
    await expect(
      submitAndSync(
        {
          submitBatch: () => Promise.reject(new Error("401 Unauthorized")),
          markSynced,
        },
        SURVEY,
        [],
      ),
    ).rejects.toThrow("401");
    expect(markSynced).not.toHaveBeenCalled();
  });

  it("reintenta una vez la marca si falla", async () => {
    const markSynced = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(undefined);
    const result = await submitAndSync(
      { submitBatch: async () => undefined, markSynced },
      SURVEY,
      [],
    );
    expect(result).toEqual({ synced: true });
    expect(markSynced).toHaveBeenCalledTimes(2);
  });

  it("un segundo fallo de la marca no invalida el envío", async () => {
    const markSynced = vi.fn().mockRejectedValue(new Error("500"));
    const result = await submitAndSync(
      { submitBatch: async () => undefined, markSynced },
      SURVEY,
      [],
    );
    expect(result).toEqual({ synced: false });
    expect(markSynced).toHaveBeenCalledTimes(2);
  });
});
