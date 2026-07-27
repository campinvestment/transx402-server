export type HeaderSource =
  | Headers
  | Record<string, string | string[] | undefined>;

function readHeader(
  headers: HeaderSource,
  name: string
): string | undefined {
  const lower = name.toLowerCase();

  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.get(name) ?? headers.get(lower) ?? undefined;
  }

  const record = headers as Record<string, string | string[] | undefined>;
  const value =
    record[name] ??
    record[lower] ??
    record[name.toUpperCase()] ??
    Object.entries(record).find(([key]) => key.toLowerCase() === lower)?.[1];

  if (Array.isArray(value)) {
    return value.find((entry) => typeof entry === "string" && entry.length > 0);
  }
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** True when PAYMENT-SIGNATURE or X-PAYMENT is present and non-empty. */
export function hasPaymentHeader(headers: HeaderSource): boolean {
  return getPaymentHeader(headers) != null;
}

/** Return PAYMENT-SIGNATURE, falling back to X-PAYMENT. */
export function getPaymentHeader(headers: HeaderSource): string | undefined {
  return (
    readHeader(headers, "payment-signature") ??
    readHeader(headers, "x-payment")
  );
}
