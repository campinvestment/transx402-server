import { afterEach, describe, expect, test, vi } from "vitest";
import { facilitatePayment } from "./facilitate.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function encodePayload(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

describe("facilitatePayment", () => {
  test("POSTs /facilitate with decoded signature and API key", async () => {
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

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ txHash: "0xtx", settlement: { transaction: "0xtx" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await facilitatePayment({
      facilitatorUrl: "http://localhost:3402/",
      apiKey: "ipk_sandbox_test",
      paymentSignature: encodePayload(paymentPayload),
    });

    expect(result.txHash).toBe("0xtx");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3402/facilitate",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "ipk_sandbox_test",
        },
      })
    );

    const body = JSON.parse(
      (fetchMock.mock.calls[0]?.[1] as { body: string }).body
    );
    expect(body.paymentPayload.accepted.amount).toBe("500000");
    expect(body.paymentRequirements.amount).toBe("500000");
  });

  test("throws FacilitationError with code and details from API body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: {
            code: "settlement_failed",
            message: "x402 settlement failed",
            details: { errorReason: "execution reverted: custom error" },
          },
        }),
      })
    );

    await expect(
      facilitatePayment({
        facilitatorUrl: "http://localhost:3402",
        apiKey: "ipk_live_test",
        paymentSignature: encodePayload({
          x402Version: 2,
          accepted: { amount: "500000" },
          payload: {},
        }),
      })
    ).rejects.toMatchObject({
      name: "FacilitationError",
      code: "settlement_failed",
      message: "x402 settlement failed",
      details: { errorReason: "execution reverted: custom error" },
      httpStatus: 500,
    });
  });
});
