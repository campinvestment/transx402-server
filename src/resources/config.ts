import {
  fetchFacilitatorConfig,
  handleFacilitatorConfigRequest,
  type FacilitatorConfigResponse,
} from "../facilitator-config.js";
import type { ClientContext } from "./context.js";

export type ConfigHandleRequestOptions = {
  /** When provided and returns false, respond 503 without calling upstream. */
  isConfigured?: () => boolean;
};

export class ConfigResource {
  constructor(private readonly ctx: ClientContext) {}

  fetch(): Promise<FacilitatorConfigResponse> {
    return fetchFacilitatorConfig(this.ctx.facilitatorUrl);
  }

  handleRequest(
    request: Request,
    options?: ConfigHandleRequestOptions
  ): Promise<Response> {
    return handleFacilitatorConfigRequest(request, {
      facilitatorUrl: this.ctx.facilitatorUrl,
      isConfigured: options?.isConfigured,
    });
  }
}
