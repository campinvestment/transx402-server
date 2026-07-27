import { toIdrxBaseUnits } from "./amount.js";
import type {
  BuildPaymentRequiredOptions,
  PaymentRequiredResponse,
} from "./types.js";

interface FacilitatorConfigResponse {
  sandbox?: {
    chainId: number;
    tokens?: { IDRX?: string };
  };
  production?: {
    chainId: number;
    tokens?: { IDRX?: string };
  };
}

export async function buildPaymentRequired(
  options: BuildPaymentRequiredOptions
): Promise<PaymentRequiredResponse> {
  const base = options.facilitatorUrl.replace(/\/$/, "");
  const response = await fetch(`${base}/config`);
  if (!response.ok) {
    throw new Error(
      `Failed to load facilitator config from ${base}/config (${response.status})`
    );
  }

  const json = (await response.json()) as FacilitatorConfigResponse;
  const section = json[options.configSection];
  if (!section?.chainId || !section.tokens?.IDRX) {
    throw new Error(
      `Facilitator /config missing ${options.configSection}.chainId or tokens.IDRX`
    );
  }

  return {
    x402Version: 2,
    resource: { url: options.resourceUrl },
    accepts: [
      {
        scheme: "exact",
        network: `eip155:${section.chainId}`,
        asset: section.tokens.IDRX,
        amount: toIdrxBaseUnits(options.priceIdr),
        payTo: options.payTo,
        maxTimeoutSeconds: options.maxTimeoutSeconds ?? 60,
        extra: {
          assetTransferMethod: "permit2",
          name: "IDRX",
          version: "1",
        },
      },
    ],
    extensions: {},
  };
}
