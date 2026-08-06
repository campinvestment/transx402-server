# Design: Stripe-style `TransX402` client for `@transx402/server`

**Date:** 2026-08-06  
**Status:** Approved  
**Version:** 0.3.0 (breaking)

## Goals

- Replace per-call `apiKey` / `facilitatorUrl` / `configSection` with a configured client instance for better DX.
- Follow Stripe-style construction: `new TransX402(apiKey, options)`.
- Use simple resource namespaces (`payments`, `config`) — not deep nesting.
- Keep pure helpers as free exports; remove credentialed free functions from the public API.

## Decisions

| Decision | Choice |
|----------|--------|
| Class name | `TransX402` |
| Construct | `new TransX402(apiKey, { environment?, facilitatorUrl? })` |
| Namespaces | `payments` + `config` only |
| Compatibility | Breaking 0.3.0 — no deprecation period for free credentialed functions |
| Pure helpers | Stay free (`hasPaymentHeader`, `toIdrxBaseUnits`, etc.) |
| Internals | Thin wrapper over existing modules; no HTTP semantic changes |
| WordPress PHP | Out of scope |
| Examples | Migrate `next-paid-content` + `agent-paid-api` in same release work |

## Public API

```ts
import { TransX402 } from "@transx402/server";

const tx402 = new TransX402(process.env.TRANSX402_API_KEY!, {
  environment: "camp",
});

await tx402.payments.processGate({ headers, payTo, priceIdr, resourceUrl });
await tx402.payments.facilitate({ paymentSignature, paymentRequired? });
await tx402.payments.verify({ txHash });
await tx402.payments.buildRequired({ payTo, priceIdr, resourceUrl });

await tx402.config.handleRequest(request);
await tx402.config.fetch();
```

### Free exports (unchanged role)

`hasPaymentHeader`, `getPaymentHeader`, `decodePaymentSignature`, `toIdrxBaseUnits`, `detectApiKeyFamily`, `FACILITATOR_PRESETS`, `DEFAULT_FACILITATOR_CONFIG_PROXY_BASE`, `browserFacilitatorProxyBase`, `FacilitationError`, shared types.

### Removed from public API

`resolveServerConfig`, `processPaymentGate`, `facilitatePayment`, `verifyPayment`, `buildPaymentRequired`, `fetchFacilitatorConfig`, `handleFacilitatorConfigRequest` — remain as internal module functions called by resources.

## Architecture

```
TransX402
├── constructor → resolveServerConfig (internal) → store { apiKey, facilitatorUrl, configSection }
├── payments: PaymentsResource
│   ├── processGate → processPaymentGate
│   ├── facilitate → facilitatePayment
│   ├── verify → verifyPayment
│   └── buildRequired → buildPaymentRequired
└── config: ConfigResource
    ├── handleRequest → handleFacilitatorConfigRequest
    └── fetch → fetchFacilitatorConfig
```

Constructor options match today’s `resolveServerConfig` semantics (environment and/or facilitatorUrl; key family must match environment).

Error behavior unchanged: `FacilitationError` from facilitate; `processGate` returns `{ kind: "paymentRequired" | "settled" | "failed" }`.

## File layout

- `src/client.ts` — `TransX402` + options type
- `src/resources/payments.ts` — `PaymentsResource`
- `src/resources/config.ts` — `ConfigResource`
- Existing modules stay implementation detail; `index.ts` exports client + pure helpers only

## Success criteria

- Merchants configure once and call `payments.*` / `config.*` without re-passing credentials.
- Package builds (ESM + CJS), type-checks, and tests pass.
- Example apps use the new client API.
- No public export of credentialed free functions.
