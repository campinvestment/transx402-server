import { afterEach, describe, expect, test, vi } from "vitest";
import { TransX402 } from "./client.js";
import { FACILITATOR_PRESETS } from "./environment.js";
import * as server from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function encodePayload(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

const paymentPayload = {
  x402Version: 2,
  accepted: {
    scheme: "exact",
    network: "eip155:1337",
    asset: "0xabc",
    amount: "500000",
    payTo: "0xmerchant",
    maxTimeoutSeconds: 60,
    extra: {
      assetTransferMethod: "permit2",
      name: "IDRX",
      version: "1",
    },
  },
  payload: { signature: "0xsig" },
};

describe("TransX402 constructor", () => {
  test("resolves camp preset and sandbox section", () => {
    const tx402 = new TransX402("ipk_sandbox_x", { environment: "camp" });
    expect(tx402.facilitatorUrl).toBe(FACILITATOR_PRESETS.camp);
    expect(tx402.configSection).toBe("sandbox");
  });

  test("rejects mismatched key family", () => {
    expect(
      () => new TransX402("ipk_sandbox_x", { environment: "base" })
    ).toThrow(/does not match/);
  });

  test("facilitatorUrl-only uses key family for section", () => {
    const tx402 = new TransX402("ipk_live_x", {
      facilitatorUrl: "https://custom.example",
    });
    expect(tx402.facilitatorUrl).toBe("https://custom.example");
    expect(tx402.configSection).toBe("production");
  });
});

describe("TransX402.payments", () => {
  test("processGate returns 402 without payment header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sandbox: { chainId: 1337, tokens: { IDRX: "0xabc" } },
        }),
      })
    );

    const tx402 = new TransX402("ipk_sandbox_test", {
      environment: "local",
    });

    const result = await tx402.payments.processGate({
      headers: {},
      payTo: "0xmerchant",
      priceIdr: "5000",
      resourceUrl: "http://localhost:3000/premium",
    });

    expect(result.kind).toBe("paymentRequired");
    if (result.kind === "paymentRequired") {
      expect(result.status).toBe(402);
      expect(result.body.accepts[0]?.amount).toBe("500000");
    }
  });

  test("processGate facilitates with stored apiKey", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sandbox: { chainId: 1337, tokens: { IDRX: "0xabc" } },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ txHash: "0xtx" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const tx402 = new TransX402("ipk_sandbox_test", {
      environment: "local",
    });

    const result = await tx402.payments.processGate({
      headers: { "payment-signature": encodePayload(paymentPayload) },
      payTo: "0xmerchant",
      priceIdr: "5000",
      resourceUrl: "http://localhost:3000/premium",
    });

    expect(result).toEqual({ kind: "settled", status: 200, txHash: "0xtx" });
    expect(fetchMock.mock.calls[1]?.[1]?.headers?.["X-API-Key"]).toBe(
      "ipk_sandbox_test"
    );
  });

  test("verify uses stored credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        verified: true,
        txHash: "0xabc",
        status: "settled",
        from: "0xfrom",
        to: "0xto",
        token: "0xtoken",
        amount: "500000",
        network: "eip155:1337",
        blockNumber: 1,
        timestamp: null,
        resource: null,
        description: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const tx402 = new TransX402("ipk_sandbox_test", {
      environment: "local",
    });

    const result = await tx402.payments.verify({ txHash: "0xabc" });
    expect(result.verified).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3402/payments/0xabc",
      { headers: { "X-API-Key": "ipk_sandbox_test" } }
    );
  });
});

describe("TransX402.config", () => {
  test("fetch proxies facilitator /config", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sandbox: { chainId: 1337, tokens: { IDRX: "0xabc" } },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const tx402 = new TransX402("ipk_sandbox_test", {
      environment: "local",
    });

    const config = await tx402.config.fetch();
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3402/config");
    expect(config.sandbox?.chainId).toBe(1337);
  });

  test("handleRequest returns proxied JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sandbox: { chainId: 1337, tokens: { IDRX: "0xabc" } },
        }),
      })
    );

    const tx402 = new TransX402("ipk_sandbox_test", {
      facilitatorUrl: "https://api.transx402.com",
    });

    const response = await tx402.config.handleRequest(
      new Request("http://merchant.test/api/transx402/config", {
        method: "GET",
      })
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      sandbox?: { chainId: number };
    };
    expect(body.sandbox?.chainId).toBe(1337);
  });
});

describe("public exports", () => {
  test("exports TransX402 and pure helpers; not credentialed free functions", () => {
    expect(server.TransX402).toBe(TransX402);
    expect(typeof server.hasPaymentHeader).toBe("function");
    expect(typeof server.toIdrxBaseUnits).toBe("function");
    expect(server.FACILITATOR_PRESETS).toBeDefined();

    expect(server).not.toHaveProperty("resolveServerConfig");
    expect(server).not.toHaveProperty("processPaymentGate");
    expect(server).not.toHaveProperty("facilitatePayment");
    expect(server).not.toHaveProperty("verifyPayment");
    expect(server).not.toHaveProperty("buildPaymentRequired");
    expect(server).not.toHaveProperty("fetchFacilitatorConfig");
    expect(server).not.toHaveProperty("handleFacilitatorConfigRequest");
  });
});
