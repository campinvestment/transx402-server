import { describe, expect, test } from "vitest";
import { resolveServerConfig, FACILITATOR_PRESETS } from "./environment.js";

describe("resolveServerConfig", () => {
  test("local + sandbox key", () => {
    const r = resolveServerConfig({
      apiKey: "ipk_sandbox_x",
      environment: "local",
    });
    expect(r.facilitatorUrl).toBe(FACILITATOR_PRESETS.local);
    expect(r.configSection).toBe("sandbox");
  });

  test("camp and base share hosted facilitator", () => {
    expect(
      resolveServerConfig({ apiKey: "ipk_sandbox_x", environment: "camp" })
        .facilitatorUrl
    ).toBe(FACILITATOR_PRESETS.camp);
    expect(
      resolveServerConfig({ apiKey: "ipk_live_x", environment: "base" })
        .facilitatorUrl
    ).toBe(FACILITATOR_PRESETS.base);
  });

  test("facilitatorUrl only uses key family", () => {
    const r = resolveServerConfig({
      apiKey: "ipk_live_x",
      facilitatorUrl: "https://custom.example",
    });
    expect(r.configSection).toBe("production");
    expect(r.facilitatorUrl).toBe("https://custom.example");
  });

  test("rejects sandbox key with base environment", () => {
    expect(() =>
      resolveServerConfig({ apiKey: "ipk_sandbox_x", environment: "base" })
    ).toThrow(/does not match/);
  });

  test("camp with facilitatorUrl override uses custom host and sandbox section", () => {
    const r = resolveServerConfig({
      apiKey: "ipk_sandbox_x",
      environment: "camp",
      facilitatorUrl: "http://localhost:3402",
    });
    expect(r.facilitatorUrl).toBe("http://localhost:3402");
    expect(r.configSection).toBe("sandbox");
  });

  test("base with facilitatorUrl override uses custom host and production section", () => {
    const r = resolveServerConfig({
      apiKey: "ipk_live_x",
      environment: "base",
      facilitatorUrl: "http://localhost:3402",
    });
    expect(r.facilitatorUrl).toBe("http://localhost:3402");
    expect(r.configSection).toBe("production");
  });
});
