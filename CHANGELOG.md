# Changelog

All notable changes to `@transx402/server` are documented in this file.

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
