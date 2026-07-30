import type {
  VerifyPaymentOptions,
  VerifyPaymentResult,
} from "./types.js";

export async function verifyPayment(
  options: VerifyPaymentOptions
): Promise<VerifyPaymentResult> {
  const base = options.facilitatorUrl.replace(/\/$/, "");
  const url = `${base}/payments/${encodeURIComponent(options.txHash)}`;
  const res = await fetch(url, {
    headers: { "X-API-Key": options.apiKey },
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(err?.error?.message ?? `Verify failed (${res.status})`);
  }

  return res.json() as Promise<VerifyPaymentResult>;
}
