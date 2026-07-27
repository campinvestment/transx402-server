export type ConfigSection = "sandbox" | "production";

export function detectApiKeyFamily(apiKey: string): ConfigSection {
  if (apiKey.startsWith("ipk_sandbox_")) return "sandbox";
  if (apiKey.startsWith("ipk_live_")) return "production";
  throw new Error(
    "Invalid API key prefix. Expected ipk_sandbox_ or ipk_live_"
  );
}
