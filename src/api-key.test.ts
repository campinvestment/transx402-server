import { describe, expect, test } from "vitest";
import { detectApiKeyFamily } from "./api-key.js";

describe("detectApiKeyFamily", () => {
  test("sandbox prefix", () => {
    expect(detectApiKeyFamily("ipk_sandbox_abc")).toBe("sandbox");
  });

  test("live prefix", () => {
    expect(detectApiKeyFamily("ipk_live_abc")).toBe("production");
  });

  test("rejects invalid prefix", () => {
    expect(() => detectApiKeyFamily("pk_test")).toThrow(/Invalid API key/);
  });
});
