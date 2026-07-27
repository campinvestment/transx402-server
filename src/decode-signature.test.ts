import { describe, expect, test } from "vitest";
import { decodePaymentSignature } from "./decode-signature.js";

describe("decodePaymentSignature", () => {
  test("decodes base64 JSON payment payload", () => {
    const payload = {
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
    const header = Buffer.from(JSON.stringify(payload), "utf8").toString(
      "base64"
    );

    const decoded = decodePaymentSignature(header);
    expect(decoded.accepted.amount).toBe("500000");
    expect(decoded.payload.signature).toBe("0xsig");
  });

  test("rejects invalid base64 JSON", () => {
    expect(() => decodePaymentSignature("%%%")).toThrow();
  });
});
