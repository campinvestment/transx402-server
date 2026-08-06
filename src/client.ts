import type { ConfigSection } from "./api-key.js";
import {
  resolveServerConfig,
  type TransX402Environment,
} from "./environment.js";
import { ConfigResource } from "./resources/config.js";
import { PaymentsResource } from "./resources/payments.js";

/**
 * Options for {@link TransX402}.
 * Set `environment` and/or `facilitatorUrl` (same rules as former `resolveServerConfig`).
 */
export type TransX402Options = {
  environment?: TransX402Environment;
  /** Overrides preset host when `environment` is set; required alone when no environment. */
  facilitatorUrl?: string;
};

/**
 * Stripe-style merchant server client.
 *
 * Configure once with your API key; call `payments.*` and `config.*` without
 * re-passing credentials.
 *
 * @example
 * ```ts
 * const tx402 = new TransX402(process.env.TRANSX402_API_KEY!, {
 *   environment: "camp",
 * });
 * await tx402.payments.processGate({ headers, payTo, priceIdr, resourceUrl });
 * ```
 */
export class TransX402 {
  readonly payments: PaymentsResource;
  readonly config: ConfigResource;

  /** Resolved facilitator base URL (no trailing slash normalization beyond resolve). */
  readonly facilitatorUrl: string;
  /** Sandbox vs production config section derived from environment / key family. */
  readonly configSection: ConfigSection;

  constructor(apiKey: string, options: TransX402Options = {}) {
    const resolved = resolveServerConfig({
      apiKey,
      environment: options.environment,
      facilitatorUrl: options.facilitatorUrl,
    });

    this.facilitatorUrl = resolved.facilitatorUrl;
    this.configSection = resolved.configSection;

    const ctx = {
      apiKey,
      facilitatorUrl: resolved.facilitatorUrl,
      configSection: resolved.configSection,
    };

    this.payments = new PaymentsResource(ctx);
    this.config = new ConfigResource(ctx);
  }
}
