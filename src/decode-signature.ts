import type { PaymentPayload } from "./types.js";

/**
 * Decode a base64 PAYMENT-SIGNATURE / X-PAYMENT header into a payment payload.
 * Matches `@x402/core/http` encode/decode (JSON → base64).
 */
export function decodePaymentSignature(
  paymentSignature: string
): PaymentPayload {
  let json: string;
  try {
    json = Buffer.from(paymentSignature, "base64").toString("utf8");
  } catch {
    throw new Error("Invalid PAYMENT-SIGNATURE: not valid base64");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid PAYMENT-SIGNATURE: not valid JSON");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("accepted" in parsed) ||
    !("payload" in parsed)
  ) {
    throw new Error(
      "Invalid PAYMENT-SIGNATURE: missing accepted or payload fields"
    );
  }

  return parsed as PaymentPayload;
}
