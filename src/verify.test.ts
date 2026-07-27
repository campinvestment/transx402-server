import { afterEach, describe, expect, test, vi } from "vitest";
import { verifyPayment } from "./verify.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("verifyPayment", () => {
  test("GETs /verify/:txHash with API key", async () => {
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
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyPayment({
      facilitatorUrl: "http://localhost:3402",
      apiKey: "ipk_sandbox_test",
      txHash: "0xtx",
    });

    expect(result.verified).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3402/verify/0xtx",
      expect.objectContaining({
        headers: { "X-API-Key": "ipk_sandbox_test" },
      })
    );
  });
});
