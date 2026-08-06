import { toIdrxBaseUnits } from "./amount.js";
import { fetchFacilitatorConfig } from "./facilitator-config.js";
import type {
  BuildPaymentRequiredOptions,
  PaymentRequiredResponse,
} from "./types.js";

export async function buildPaymentRequired(
  options: BuildPaymentRequiredOptions
): Promise<PaymentRequiredResponse> {
  const json = await fetchFacilitatorConfig(options.facilitatorUrl);
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
