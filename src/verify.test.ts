import { afterEach, describe, expect, test, vi } from "vitest";
import { verifyPayment } from "./verify.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("verifyPayment", () => {
  test("GETs /payments/:txHash with API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        verified: true,
        txHash: "0xtx",
        status: "confirmed",
        from: "0xpayer",
        to: "0xmerchant",
        token: "IDRX",
        amount: "500000",
        network: "sandbox",
        blockNumber: 12345,
        timestamp: "2026-04-01T10:30:00.000Z",
        resource: "https://example.com/article/123",
        description: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyPayment({
      facilitatorUrl: "http://localhost:3402",
      apiKey: "ipk_sandbox_test",
      txHash: "0xtx",
    });

    expect(result.verified).toBe(true);
    expect(result.resource).toBe("https://example.com/article/123");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3402/payments/0xtx",
      expect.objectContaining({
        headers: { "X-API-Key": "ipk_sandbox_test" },
      })
    );
  });
});
