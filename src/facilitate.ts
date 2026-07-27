import { decodePaymentSignature } from "./decode-signature.js";
import type { PaymentRequiredResponse } from "./types.js";

export async function facilitatePayment(options: {
  facilitatorUrl: string;
  apiKey: string;
  paymentSignature: string;
  paymentRequired?: PaymentRequiredResponse;
}): Promise<{ txHash: string | null; settlement?: Record<string, unknown> }> {
  const paymentPayload = decodePaymentSignature(options.paymentSignature);
  const paymentRequirements =
    options.paymentRequired?.accepts[0] ?? paymentPayload.accepted;

  const base = options.facilitatorUrl.replace(/\/$/, "");
  const response = await fetch(`${base}/facilitate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": options.apiKey,
    },
    body: JSON.stringify({
      paymentPayload,
      paymentRequirements,
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: { message?: string; code?: string };
    } | null;
    throw new Error(
      error?.error?.message ??
        `Payment facilitation failed (${response.status})`
    );
  }

  const result = (await response.json()) as {
    txHash?: string;
    settlement?: Record<string, unknown> & { transaction?: string };
  };

  return {
    txHash: result.txHash ?? result.settlement?.transaction ?? null,
    settlement: result.settlement,
  };
}
