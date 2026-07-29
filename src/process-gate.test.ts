import { afterEach, describe, expect, test, vi } from "vitest";
import { processPaymentGate } from "./process-gate.js";

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

describe("processPaymentGate", () => {
  test("returns 402 body when no payment header", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sandbox: { chainId: 1337, tokens: { IDRX: "0xabc" } },
        }),
      })
    );

    const result = await processPaymentGate({
      headers: {},
      facilitatorUrl: "http://localhost:3402",
      apiKey: "ipk_sandbox_test",
      configSection: "sandbox",
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

  test("facilitates when header present", async () => {
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

    const result = await processPaymentGate({
      headers: { "payment-signature": encodePayload(paymentPayload) },
      facilitatorUrl: "http://localhost:3402",
      apiKey: "ipk_sandbox_test",
      configSection: "sandbox",
      payTo: "0xmerchant",
      priceIdr: "5000",
      resourceUrl: "http://localhost:3000/premium",
    });

    expect(result).toEqual({
      kind: "settled",
      status: 200,
      txHash: "0xtx",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("returns code and details when facilitation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            production: { chainId: 8453, tokens: { IDRX: "0xabc" } },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            error: {
              code: "settlement_failed",
              message: "x402 settlement failed",
              details: { errorReason: "execution reverted: insufficient balance" },
            },
          }),
        })
    );

    const result = await processPaymentGate({
      headers: { "payment-signature": encodePayload(paymentPayload) },
      facilitatorUrl: "http://localhost:3402",
      apiKey: "ipk_live_test",
      configSection: "production",
      payTo: "0xmerchant",
      priceIdr: "5000",
      resourceUrl: "http://localhost:3420/api/premium",
    });

    expect(result).toEqual({
      kind: "failed",
      status: 500,
      error: "x402 settlement failed",
      code: "settlement_failed",
      details: { errorReason: "execution reverted: insufficient balance" },
    });
  });
});
