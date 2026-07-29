/** Structured error from POST /facilitate — preserves API error.code and details. */
export class FacilitationError extends Error {
  readonly code: string;
  readonly details?: Record<string, string>;
  readonly httpStatus: number;

  constructor(
    code: string,
    message: string,
    options?: { details?: Record<string, string>; httpStatus?: number }
  ) {
    super(message);
    this.name = "FacilitationError";
    this.code = code;
    this.details = options?.details;
    this.httpStatus = options?.httpStatus ?? 402;
  }
}

export function facilitationHttpStatus(code: string): number {
  if (code === "settlement_failed" || code === "tx_failed") {
    return 500;
  }
  return 402;
}

/** Duck-type check — survives duplicate module instances under bundlers. */
export function isFacilitationError(
  err: unknown
): err is FacilitationError {
  return (
    err instanceof FacilitationError ||
    (typeof err === "object" &&
      err !== null &&
      (err as FacilitationError).name === "FacilitationError" &&
      typeof (err as FacilitationError).code === "string" &&
      typeof (err as FacilitationError).message === "string")
  );
}
