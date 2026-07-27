import type { ConfigSection } from "./api-key.js";
import { getPaymentHeader, type HeaderSource } from "./payment-header.js";
import { buildPaymentRequired } from "./payment-required.js";
import { facilitatePayment } from "./facilitate.js";
import type { PaymentRequiredResponse } from "./types.js";

export type ProcessPaymentGateResult =
  | { kind: "paymentRequired"; status: 402; body: PaymentRequiredResponse }
  | { kind: "settled"; status: 200; txHash: string | null }
  | { kind: "failed"; status: 402 | 500; error: string };

export async function processPaymentGate(options: {
  headers: HeaderSource;
  facilitatorUrl: string;
  apiKey: string;
  configSection: ConfigSection;
  payTo: string;
  priceIdr: string | number;
  resourceUrl: string;
}): Promise<ProcessPaymentGateResult> {
  const paymentRequired = await buildPaymentRequired({
    facilitatorUrl: options.facilitatorUrl,
    configSection: options.configSection,
    payTo: options.payTo,
    priceIdr: options.priceIdr,
    resourceUrl: options.resourceUrl,
  });

  const paymentSignature = getPaymentHeader(options.headers);
  if (!paymentSignature) {
    return {
      kind: "paymentRequired",
      status: 402,
      body: paymentRequired,
    };
  }

  try {
    const settlement = await facilitatePayment({
      facilitatorUrl: options.facilitatorUrl,
      apiKey: options.apiKey,
      paymentSignature,
      paymentRequired,
    });
    return {
      kind: "settled",
      status: 200,
      txHash: settlement.txHash,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      kind: "failed",
      status: 402,
      error: message,
    };
  }
}
