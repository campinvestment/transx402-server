export interface FacilitatorEnvConfig {
  chainId: number;
  tokens?: { IDRX?: string };
}

export interface FacilitatorConfigResponse {
  sandbox?: FacilitatorEnvConfig;
  production?: FacilitatorEnvConfig;
}

export const DEFAULT_FACILITATOR_CONFIG_PROXY_BASE = "/api/transx402";

function normalizeFacilitatorBase(facilitatorUrl: string): string {
  return facilitatorUrl.replace(/\/$/, "");
}

/**
 * Fetch facilitator GET /config from the upstream host.
 * Public endpoint — no API key required.
 */
export async function fetchFacilitatorConfig(
  facilitatorUrl: string
): Promise<FacilitatorConfigResponse> {
  const base = normalizeFacilitatorBase(facilitatorUrl);
  const response = await fetch(`${base}/config`);
  if (!response.ok) {
    throw new Error(
      `Failed to load facilitator config from ${base}/config (${response.status})`
    );
  }

  return (await response.json()) as FacilitatorConfigResponse;
}

/**
 * Same-origin base path for browser clients (appends `/config` internally).
 */
export function browserFacilitatorProxyBase(
  path: string = DEFAULT_FACILITATOR_CONFIG_PROXY_BASE
): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) {
    throw new Error(
      `config proxy path must start with "/" (received "${path}")`
    );
  }
  return trimmed.replace(/\/+$/, "");
}

export interface FacilitatorConfigProxyOptions {
  facilitatorUrl: string;
  /** When provided and returns false, respond 503 without calling upstream. */
  isConfigured?: () => boolean;
}

/**
 * Web Standard handler for merchant GET /config proxy routes.
 * Proxies facilitator config same-origin for browser clients (server settlement).
 */
export async function handleFacilitatorConfigRequest(
  request: Request,
  options: FacilitatorConfigProxyOptions
): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (options.isConfigured && !options.isConfigured()) {
    return Response.json({ error: "TransX402 is not configured" }, { status: 503 });
  }

  try {
    const config = await fetchFacilitatorConfig(options.facilitatorUrl);
    return Response.json(config);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Facilitator config unavailable";
    return Response.json({ error: message }, { status: 503 });
  }
}
