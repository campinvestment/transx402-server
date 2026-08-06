import { facilitatePayment } from "../facilitate.js";
import { buildPaymentRequired } from "../payment-required.js";
import {
  processPaymentGate,
  type ProcessPaymentGateResult,
} from "../process-gate.js";
import { verifyPayment } from "../verify.js";
import type {
  PaymentRequiredResponse,
  VerifyPaymentResult,
} from "../types.js";
import type { HeaderSource } from "../payment-header.js";
import type { ClientContext } from "./context.js";

export type ProcessGateOptions = {
  headers: HeaderSource;
  payTo: string;
  priceIdr: string | number;
  resourceUrl: string;
};

export type FacilitateOptions = {
  paymentSignature: string;
  paymentRequired?: PaymentRequiredResponse;
};

export type VerifyOptions = {
  txHash: string;
};

export type BuildRequiredOptions = {
  payTo: string;
  priceIdr: string | number;
  resourceUrl: string;
  maxTimeoutSeconds?: number;
};

export class PaymentsResource {
  constructor(private readonly ctx: ClientContext) {}

  processGate(options: ProcessGateOptions): Promise<ProcessPaymentGateResult> {
    return processPaymentGate({
      ...options,
      facilitatorUrl: this.ctx.facilitatorUrl,
      apiKey: this.ctx.apiKey,
      configSection: this.ctx.configSection,
    });
  }

  facilitate(
    options: FacilitateOptions
  ): Promise<{ txHash: string | null; settlement?: Record<string, unknown> }> {
    return facilitatePayment({
      ...options,
      facilitatorUrl: this.ctx.facilitatorUrl,
      apiKey: this.ctx.apiKey,
    });
  }

  verify(options: VerifyOptions): Promise<VerifyPaymentResult> {
    return verifyPayment({
      txHash: options.txHash,
      facilitatorUrl: this.ctx.facilitatorUrl,
      apiKey: this.ctx.apiKey,
    });
  }

  buildRequired(
    options: BuildRequiredOptions
  ): Promise<PaymentRequiredResponse> {
    return buildPaymentRequired({
      ...options,
      facilitatorUrl: this.ctx.facilitatorUrl,
      configSection: this.ctx.configSection,
    });
  }
}
