import { describe, expect, it } from "vitest";
import { formatResponseValue } from "./formatResponseValue";

const base = {
  questionType: "numeric",
  numericValue: null,
  optionText: null,
  textValue: null,
  booleanValue: null,
};

describe("formatResponseValue — números deterministas", () => {
  it("usa punto decimal y conserva los decimales", () => {
    expect(formatResponseValue({ ...base, numericValue: 3.5 })).toBe("3.5");
  });

  it("no altera enteros largos ni usa separador de miles", () => {
    expect(formatResponseValue({ ...base, numericValue: 900930010 })).toBe(
      "900930010",
    );
    expect(formatResponseValue({ ...base, numericValue: 1234567.25 })).toBe(
      "1234567.25",
    );
  });

  it("numeric_with_unit combina número y unidad", () => {
    expect(
      formatResponseValue({
        ...base,
        questionType: "numeric_with_unit",
        numericValue: 2.5,
        optionText: "ha",
      }),
    ).toBe("2.5 ha");
  });
});
