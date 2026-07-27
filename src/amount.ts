/** Convert whole IDR to IDRX base units (IDRX has 2 decimals). */
export function toIdrxBaseUnits(idrWhole: string | number): string {
  const raw = typeof idrWhole === "number" ? String(idrWhole) : idrWhole.trim();
  if (!/^[1-9]\d*$/.test(raw)) {
    throw new Error("priceIdr must be a positive whole IDR amount");
  }
  return (BigInt(raw) * 100n).toString();
}
