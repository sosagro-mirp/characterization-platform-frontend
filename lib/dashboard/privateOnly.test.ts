import { describe, expect, it } from "vitest";
import {
  PRIVATE_ONLY_AUDIENCE_ERROR,
  privateOnlyReasons,
  validateChartForm,
  type ChartFormValues,
  type ChartSource,
} from "./chartCompat";

// Spec 109 (Fase 6) — aviso «Solo privada»: una fuente con `privateOnlyReason`
// no puede publicarse en un gráfico de audiencia pública.
const matrix = [{ questionType: "yes_no", charts: ["yes-percent-bars"], combineModes: ["merge" as const] }];

function source(privateOnlyReason?: string | null): ChartSource {
  return { questionId: "q1", questionType: "yes_no", options: [], selectable: true, privateOnlyReason };
}

function values(audience: "public" | "private", sources: ChartSource[]): ChartFormValues {
  return {
    title: "Título",
    subtitle: "",
    categoryId: "c1",
    audience,
    layout: "normal",
    combineMode: "merge",
    chartKind: "yes-percent-bars",
    sources,
    settings: {},
  };
}

describe("privateOnlyReasons", () => {
  it("devuelve los motivos sin repetir y sin vacíos", () => {
    expect(
      privateOnlyReasons([
        { privateOnlyReason: "Dato sensible" },
        { privateOnlyReason: "Dato sensible" },
        { privateOnlyReason: null },
        {},
        { privateOnlyReason: "  " },
      ]),
    ).toEqual(["Dato sensible"]);
  });
});

describe("validateChartForm — solo privada", () => {
  it("rechaza audiencia pública con una fuente de dato sensible", () => {
    const r = validateChartForm(values("public", [source("Dato sensible")]), { matrix });
    expect(r.errors.audience).toBe(PRIVATE_ONLY_AUDIENCE_ERROR);
    expect(r.valid).toBe(false);
  });

  it("acepta la misma fuente con audiencia privada", () => {
    const r = validateChartForm(values("private", [source("Dato sensible")]), { matrix });
    expect(r.errors.audience).toBeUndefined();
  });

  it("no afecta a fuentes sin motivo", () => {
    const r = validateChartForm(values("public", [source(null)]), { matrix });
    expect(r.errors.audience).toBeUndefined();
  });
});
