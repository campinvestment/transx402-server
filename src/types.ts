import type { ConfigSection } from "./api-key.js";

export interface BuildPaymentRequiredOptions {
  facilitatorUrl: string;
  configSection: ConfigSection;
  payTo: string;
  priceIdr: string | number;
  resourceUrl: string;
  maxTimeoutSeconds?: number;
}

export interface PaymentRequiredResponse {
  x402Version: 2;
  resource: { url: string };
  accepts: Array<{
    scheme: "exact";
    network: string;
    asset: string;
    amount: string;
    payTo: string;
    maxTimeoutSeconds: number;
    extra: {
      assetTransferMethod: "permit2";
      name: "IDRX";
      version: "1";
    };
  }>;
  extensions: Record<string, unknown>;
}

/** Minimal payment payload shape accepted by POST /facilitate. */
export interface PaymentPayload {
  x402Version: number;
  resource?: unknown;
  accepted: PaymentRequiredResponse["accepts"][number];
  payload: Record<string, unknown>;
  extensions?: Record<string, unknown>;
}

export interface VerifyPaymentOptions {
  facilitatorUrl: string;
  apiKey: string;
  txHash: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  txHash: string;
  status: string;
  from: string;
  to: string;
  token: string;
  amount: string;
  network: string;
}
