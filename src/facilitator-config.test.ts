import { afterEach, describe, expect, test, vi } from "vitest";
import {
  browserFacilitatorProxyBase,
  DEFAULT_FACILITATOR_CONFIG_PROXY_BASE,
  fetchFacilitatorConfig,
  handleFacilitatorConfigRequest,
} from "./facilitator-config.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("fetchFacilitatorConfig", () => {
  test("fetches and parses facilitator /config", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sandbox: { chainId: 1337, tokens: { IDRX: "0xabc" } },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const config = await fetchFacilitatorConfig("http://localhost:3402/");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3402/config");
    expect(config.sandbox?.chainId).toBe(1337);
  });

  test("throws on upstream failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
      })
    );

    await expect(fetchFacilitatorConfig("http://localhost:3402")).rejects.toThrow(
      "Failed to load facilitator config from http://localhost:3402/config (502)"
    );
  });
});

describe("browserFacilitatorProxyBase", () => {
  test("returns default path without trailing slash", () => {
    expect(browserFacilitatorProxyBase()).toBe(
      DEFAULT_FACILITATOR_CONFIG_PROXY_BASE
    );
  });

  test("normalizes custom path", () => {
    expect(browserFacilitatorProxyBase("/api/custom/transx402/")).toBe(
      "/api/custom/transx402"
    );
  });

  test("rejects non-relative paths", () => {
    expect(() => browserFacilitatorProxyBase("api/transx402")).toThrow(
      'config proxy path must start with "/"'
    );
  });
});

describe("handleFacilitatorConfigRequest", () => {
  test("GET returns proxied JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sandbox: { chainId: 1337, tokens: { IDRX: "0xabc" } },
        }),
      })
    );

    const response = await handleFacilitatorConfigRequest(
      new Request("http://merchant.test/api/transx402/config", { method: "GET" }),
      { facilitatorUrl: "https://api.transx402.com" }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      sandbox: { chainId: 1337, tokens: { IDRX: "0xabc" } },
    });
  });

  test("non-GET returns 405", async () => {
    const response = await handleFacilitatorConfigRequest(
      new Request("http://merchant.test/api/transx402/config", { method: "POST" }),
      { facilitatorUrl: "https://api.transx402.com" }
    );

    expect(response.status).toBe(405);
  });

  test("upstream failure returns 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      })
    );

    const response = await handleFacilitatorConfigRequest(
      new Request("http://merchant.test/api/transx402/config", { method: "GET" }),
      { facilitatorUrl: "https://api.transx402.com" }
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("Failed to load facilitator config"),
    });
  });

  test("isConfigured false returns 503 without upstream call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleFacilitatorConfigRequest(
      new Request("http://merchant.test/api/transx402/config", { method: "GET" }),
      {
        facilitatorUrl: "https://api.transx402.com",
        isConfigured: () => false,
      }
    );

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
