import type { ConfigSection } from "../api-key.js";

/** Resolved credentials shared by all resource methods. */
export type ClientContext = {
  apiKey: string;
  facilitatorUrl: string;
  configSection: ConfigSection;
};
