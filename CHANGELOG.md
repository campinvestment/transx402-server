# Changelog

All notable changes to `@transx402/server` are documented in this file.

## [0.3.0] - 2026-08-06

### Changed

- **Breaking:** Introduce Stripe-style `TransX402` client. Configure once with `new TransX402(apiKey, { environment?, facilitatorUrl? })`, then call `payments.*` / `config.*`.
- **Breaking:** Remove public credentialed free functions: `resolveServerConfig`, `processPaymentGate`, `facilitatePayment`, `verifyPayment`, `buildPaymentRequired`, `fetchFacilitatorConfig`, `handleFacilitatorConfigRequest`.

### Added

- `TransX402` class with `payments` (`processGate`, `facilitate`, `verify`, `buildRequired`) and `config` (`handleRequest`, `fetch`) resources
- Pure helpers remain free exports (`hasPaymentHeader`, `toIdrxBaseUnits`, `FACILITATOR_PRESETS`, etc.)

## [0.2.1] - 2026-08-06

### Added

- `fetchFacilitatorConfig` — shared upstream `GET /config` fetch
- `handleFacilitatorConfigRequest` — Web Standard handler for merchant config proxy routes
- `browserFacilitatorProxyBase` / `DEFAULT_FACILITATOR_CONFIG_PROXY_BASE` — same-origin path helpers for browser clients

## [0.2.0] - 2026-07-30

### Changed

- `verifyPayment` now calls `GET /payments/:txHash` instead of deprecated `GET /verify/:txHash`
- `VerifyPaymentResult` includes `resource`, `description`, `blockNumber`, and `timestamp` for deferred unlock flows (e.g. pay-per-article)

## [0.1.0] - 2026-07-27

### Added

- Initial public release of `@transx402/server`
- `buildPaymentRequired` — HTTP 402 Payment Required body from facilitator `/config`
- `facilitatePayment` — decode `PAYMENT-SIGNATURE` and `POST /facilitate` with server API key
- `processPaymentGate` — convenience helper for Route Handlers (402 or settle)
- `hasPaymentHeader` / `getPaymentHeader` / `decodePaymentSignature`
- `verifyPayment` — post-settlement `GET /verify/:txHash` lookup
- `toIdrxBaseUnits`, `detectApiKeyFamily`, `resolveServerConfig`, `FACILITATOR_PRESETS`

[0.1.0]: https://github.com/campinvestment/transx402-server/releases/tag/v0.1.0
