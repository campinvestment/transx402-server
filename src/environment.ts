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
 * Resolve facilitator URL and config section.
 * `facilitatorUrl` optionally overrides preset host when `environment` is set.
 */
export function resolveServerConfig(options: {
  apiKey: string;
  environment?: TransX402Environment;
  facilitatorUrl?: string;
}): { facilitatorUrl: string; configSection: ConfigSection } {
  const hasEnvironment = options.environment != null;
  const facilitatorOverride = options.facilitatorUrl?.trim();
  const hasFacilitatorOverride = Boolean(facilitatorOverride);

  if (!hasEnvironment && !hasFacilitatorOverride) {
    throw new Error(
      'Set `environment` ("local" | "camp" | "base") or `facilitatorUrl`. ' +
        "No silent default — choose explicitly."
    );
  }

  if (hasEnvironment) {
    const environment = options.environment!;
    assertApiKeyMatchesEnvironment(options.apiKey, environment);
    return {
      facilitatorUrl:
        facilitatorOverride || FACILITATOR_PRESETS[environment],
      configSection: environmentToConfigSection(environment),
    };
  }

  return {
    facilitatorUrl: facilitatorOverride!,
    configSection: detectApiKeyFamily(options.apiKey),
  };
}
