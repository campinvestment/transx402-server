export { FacilitationError } from "./errors.js";
export { toIdrxBaseUnits } from "./amount.js";
export { detectApiKeyFamily, type ConfigSection } from "./api-key.js";
export {
  FACILITATOR_PRESETS,
  resolveServerConfig,
  type TransX402Environment,
} from "./environment.js";
export {
  browserFacilitatorProxyBase,
  DEFAULT_FACILITATOR_CONFIG_PROXY_BASE,
  fetchFacilitatorConfig,
  handleFacilitatorConfigRequest,
  type FacilitatorConfigProxyOptions,
  type FacilitatorConfigResponse,
} from "./facilitator-config.js";
export { buildPaymentRequired } from "./payment-required.js";
export {
  hasPaymentHeader,
  getPaymentHeader,
  type HeaderSource,
} from "./payment-header.js";
export { decodePaymentSignature } from "./decode-signature.js";
export { verifyPayment } from "./verify.js";
export { facilitatePayment } from "./facilitate.js";
export {
  processPaymentGate,
  type ProcessPaymentGateResult,
} from "./process-gate.js";
export type {
  BuildPaymentRequiredOptions,
  PaymentRequiredResponse,
  PaymentPayload,
  VerifyPaymentOptions,
  VerifyPaymentResult,
} from "./types.js";
