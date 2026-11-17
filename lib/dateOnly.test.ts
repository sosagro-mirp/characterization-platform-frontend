import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { formatDateOnly, todayDateOnly } from "./dateOnly";

// Run as if in Colombia (UTC-5), where the bug showed up.
const originalTz = process.env.TZ;
beforeEach(() => {
  process.env.TZ = "America/Bogota";
});
afterEach(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

describe("formatDateOnly", () => {
  it("keeps the calendar day of a YYYY-MM-DD value", () => {
    expect(formatDateOnly("2026-03-04")).toBe("4/3/2026");
  });

  it("keeps the calendar day of a UTC-midnight timestamp", () => {
    expect(formatDateOnly("2026-03-04T00:00:00.000Z")).toBe("4/3/2026");
  });
});

describe("todayDateOnly", () => {
  it("uses the local day after 19:00 in Colombia, not the UTC one", () => {
    // 2026-03-04 20:30 in Bogotá is already 2026-03-05 in UTC.
    const evening = new Date("2026-03-05T01:30:00.000Z");
    expect(todayDateOnly(evening)).toBe("2026-03-04");
  });
});

describe("date-only call sites", () => {
  it("the naive formatting really shifts the day in Colombia", () => {
    expect(new Date("2026-03-04").toLocaleDateString("es-CO")).toBe(
      "3/3/2026",
    );
  });

  it.each([
    "components/instrument-editor/InstrumentEditorLayout.tsx",
    "components/instrument-editor/InstrumentForm.tsx",
  ])("%s uses the date-only helpers", async (file) => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(file, "utf8");
    expect(source).not.toMatch(/toISOString\(\)\.slice\(0, 10\)/);
    expect(source).not.toMatch(
      /new Date\(instrumentPublishDate\)\.toLocaleDateString/,
    );
    expect(source).toMatch(/from "@\/lib\/dateOnly"/);
  });
});
