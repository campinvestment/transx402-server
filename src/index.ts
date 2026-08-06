export { FacilitationError } from "./errors.js";
export { toIdrxBaseUnits } from "./amount.js";
export { detectApiKeyFamily, type ConfigSection } from "./api-key.js";
export {
  FACILITATOR_PRESETS,
  type TransX402Environment,
} from "./environment.js";
export {
  browserFacilitatorProxyBase,
  DEFAULT_FACILITATOR_CONFIG_PROXY_BASE,
  type FacilitatorConfigProxyOptions,
  type FacilitatorConfigResponse,
} from "./facilitator-config.js";
export {
  hasPaymentHeader,
  getPaymentHeader,
  type HeaderSource,
} from "./payment-header.js";
export { decodePaymentSignature } from "./decode-signature.js";
export { TransX402, type TransX402Options } from "./client.js";
export { PaymentsResource } from "./resources/payments.js";
export type {
  ProcessGateOptions,
  FacilitateOptions,
  VerifyOptions,
  BuildRequiredOptions,
} from "./resources/payments.js";
export { ConfigResource } from "./resources/config.js";
export type { ConfigHandleRequestOptions } from "./resources/config.js";
export type { ProcessPaymentGateResult } from "./process-gate.js";
export type {
  BuildPaymentRequiredOptions,
  PaymentRequiredResponse,
  PaymentPayload,
  VerifyPaymentOptions,
  VerifyPaymentResult,
} from "./types.js";
