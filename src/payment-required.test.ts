import { afterEach, describe, expect, test, vi } from "vitest";
import { buildPaymentRequired } from "./payment-required.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("buildPaymentRequired", () => {
  test("builds x402 v2 body from facilitator /config", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sandbox: {
            chainId: 1337,
            tokens: { IDRX: "0xabc" },
          },
        }),
      })
    );

    const body = await buildPaymentRequired({
      facilitatorUrl: "http://localhost:3402",
      configSection: "sandbox",
      payTo: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      priceIdr: "5000",
      resourceUrl: "http://localhost:3000/api/premium",
    });

    expect(body.x402Version).toBe(2);
    expect(body.accepts[0]?.network).toBe("eip155:1337");
    expect(body.accepts[0]?.amount).toBe("500000");
    expect(body.accepts[0]?.asset).toBe("0xabc");
    expect(body.accepts[0]?.extra.assetTransferMethod).toBe("permit2");
  });
});
