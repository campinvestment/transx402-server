import {
  detectApiKeyFamily,
  type ConfigSection,
} from "./api-key.js";

export type TransX402Environment = "local" | "camp" | "base";

export const FACILITATOR_PRESETS = {
  local: "http://localhost:3402",
  camp: "https://api.transx402.com",
  base: "https://api.transx402.com",
} as const satisfies Record<TransX402Environment, string>;

function environmentToConfigSection(
  environment: TransX402Environment
): ConfigSection {
  return environment === "base" ? "production" : "sandbox";
}

function assertApiKeyMatchesEnvironment(
  apiKey: string,
  environment: TransX402Environment
): void {
  const family = detectApiKeyFamily(apiKey);
  const expected = environmentToConfigSection(environment);
  if (family !== expected) {
    throw new Error(
      `API key family "${family}" does not match environment "${environment}". ` +
        `Use ipk_${expected === "sandbox" ? "sandbox" : "live"}_... for ${environment}.`
    );
  }
}

/**
 * Resolve facilitator URL from a conflict-free options union.
 * Throws if both `environment` and `facilitatorUrl` are set, or neither.
 */
export function resolveServerConfig(options: {
  apiKey: string;
  environment?: TransX402Environment;
  facilitatorUrl?: string;
}): { facilitatorUrl: string; configSection: ConfigSection } {
  const hasEnvironment = options.environment != null;
  const hasFacilitatorUrl =
    typeof options.facilitatorUrl === "string" &&
    options.facilitatorUrl.length > 0;

  if (hasEnvironment && hasFacilitatorUrl) {
    throw new Error(
      "Set either `environment` or `facilitatorUrl`, not both. " +
        "Chain params always come from GET /config."
    );
  }

  if (!hasEnvironment && !hasFacilitatorUrl) {
    throw new Error(
      'Set `environment` ("local" | "camp" | "base") or `facilitatorUrl`. ' +
        "No silent default — choose explicitly."
    );
  }

  if (hasEnvironment) {
    const environment = options.environment!;
    assertApiKeyMatchesEnvironment(options.apiKey, environment);
    return {
      facilitatorUrl: FACILITATOR_PRESETS[environment],
      configSection: environmentToConfigSection(environment),
    };
  }

  return {
    facilitatorUrl: options.facilitatorUrl!,
    configSection: detectApiKeyFamily(options.apiKey),
  };
}
