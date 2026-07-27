import { describe, expect, test } from "vitest";
import { hasPaymentHeader, getPaymentHeader } from "./payment-header.js";

describe("payment headers", () => {
  test("detects PAYMENT-SIGNATURE", () => {
    expect(hasPaymentHeader({ "payment-signature": "abc" })).toBe(true);
    expect(getPaymentHeader({ "payment-signature": "abc" })).toBe("abc");
  });

  test("detects x-payment fallback", () => {
    expect(hasPaymentHeader({ "x-payment": "sig" })).toBe(true);
    expect(getPaymentHeader({ "x-payment": "sig" })).toBe("sig");
  });

  test("handles array header values", () => {
    expect(hasPaymentHeader({ "payment-signature": ["", "sig"] })).toBe(true);
    expect(getPaymentHeader({ "payment-signature": ["", "sig"] })).toBe("sig");
  });

  test("empty when missing", () => {
    expect(hasPaymentHeader({})).toBe(false);
    expect(getPaymentHeader({})).toBeUndefined();
  });

  test("works with Headers", () => {
    const headers = new Headers({ "PAYMENT-SIGNATURE": "abc" });
    expect(hasPaymentHeader(headers)).toBe(true);
    expect(getPaymentHeader(headers)).toBe("abc");
  });
});
