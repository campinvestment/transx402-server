import { describe, expect, test } from "vitest";
import { toIdrxBaseUnits } from "./amount.js";

describe("toIdrxBaseUnits", () => {
  test("converts whole IDR to 2-decimal base units", () => {
    expect(toIdrxBaseUnits("5000")).toBe("500000");
    expect(toIdrxBaseUnits(5000)).toBe("500000");
  });

  test("rejects non-positive", () => {
    expect(() => toIdrxBaseUnits("0")).toThrow();
    expect(() => toIdrxBaseUnits("-1")).toThrow();
    expect(() => toIdrxBaseUnits("1.5")).toThrow();
  });
});
