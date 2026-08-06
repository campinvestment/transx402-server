# `@transx402/server`

IDRX x402 **merchant backend** SDK. Use with [`@transx402/client`](https://www.npmjs.com/package/@transx402/client) in **`settlement: 'server'`** mode (canonical x402): the browser signs; your server calls `POST /facilitate`.

- Source: [github.com/campinvestment/transx402-server](https://github.com/campinvestment/transx402-server)
- npm: [npmjs.com/package/@transx402/server](https://www.npmjs.com/package/@transx402/server)
- Docs: [docs.transx402.com](https://docs.transx402.com)

## Install

```bash
npm install @transx402/server
# or
pnpm add @transx402/server
```

**Zero runtime dependencies** — Node 20+ `fetch` only.

## Canonical flow

1. Client `fetch()` hits your API → you return **402** + payment requirements
2. Client wallet signs → retries with `PAYMENT-SIGNATURE`
3. Your Route Handler calls `tx402.payments.processGate` → `POST /facilitate` with server `X-API-Key`
4. On success, return paid content

Keep `ipk_` API keys on the **server** for this mode. For paywall / static sites without a merchant API, use `@transx402/client` **`settlement: 'direct'`** instead.

## Quick start (Next.js Route Handler)

```ts
import { TransX402 } from "@transx402/server";

const tx402 = new TransX402(process.env.TRANSX402_API_KEY!, {
  environment: "local", // or "camp" | "base"
});

export async function GET(request: Request) {
  const gate = await tx402.payments.processGate({
    headers: request.headers,
    payTo: process.env.MERCHANT_WALLET!,
    priceIdr: "5000",
    resourceUrl: request.url,
  });

  if (gate.kind === "paymentRequired") {
    return Response.json(gate.body, { status: 402 });
  }
  if (gate.kind === "failed") {
    return Response.json({ error: gate.error }, { status: gate.status });
  }

  return Response.json({
    paid: true,
    txHash: gate.txHash,
    content: "Premium unlocked",
  });
}
```

Pair with the browser client (use a same-origin config proxy — see below):

```ts
import { createBrowserClient } from "@transx402/client/browser";

const client = createBrowserClient({
  environment: "local",
  settlement: "server", // default for fetch()
  configProxyPath: "/api/transx402",
});

await client.fetch("/api/premium");
```

## Config proxy (server settlement)

Browsers load chain params via `GET /config`. Without a merchant-domain CORS allowlist on the hosted facilitator, that cross-origin call fails. Expose a **same-origin proxy** on your backend and point the browser client at it.

Default proxy base path: `/api/transx402` (client appends `/config`).

```ts
// app/api/transx402/config/route.ts
import { TransX402 } from "@transx402/server";

const apiKey = process.env.TRANSX402_API_KEY_SANDBOX!;
const tx402 = new TransX402(apiKey, { environment: "camp" });

export async function GET(request: Request) {
  return tx402.config.handleRequest(request, {
    isConfigured: () => Boolean(apiKey?.trim()),
  });
}
```

Your payment Route Handler still calls the facilitator **directly** server-to-server for `GET /config` (402 body) and `POST /facilitate`. Only the browser uses the proxy.

## API

### Client

| Member | Purpose |
|--------|---------|
| `new TransX402(apiKey, options)` | Configure once (`environment` and/or `facilitatorUrl`) |
| `tx402.payments.processGate` | No header → 402; header → facilitate |
| `tx402.payments.facilitate` | Decode header → `POST /facilitate` |
| `tx402.payments.verify` | Post-settlement `GET /payments/:txHash` |
| `tx402.payments.buildRequired` | Build x402 v2 402 JSON from facilitator `/config` |
| `tx402.config.handleRequest` | Web Standard handler for merchant config proxy routes |
| `tx402.config.fetch` | Upstream `GET /config` |

### Free helpers

| Export | Purpose |
|--------|---------|
| `hasPaymentHeader` / `getPaymentHeader` | Read `PAYMENT-SIGNATURE` / `X-PAYMENT` |
| `decodePaymentSignature` | Base64 JSON decode of payment payload |
| `toIdrxBaseUnits` | Whole IDR → IDRX base units (×100) |
| `detectApiKeyFamily` | `ipk_sandbox_` / `ipk_live_` → section |
| `browserFacilitatorProxyBase` / `DEFAULT_FACILITATOR_CONFIG_PROXY_BASE` | Same-origin base path for browser clients |
| `FACILITATOR_PRESETS` | Named facilitator hosts |
| `FacilitationError` | Error class from facilitate failures |

## Migration from 0.2.x

```ts
// Before
const { facilitatorUrl, configSection } = resolveServerConfig({ apiKey, environment });
await processPaymentGate({ headers, facilitatorUrl, apiKey, configSection, ... });

// After
const tx402 = new TransX402(apiKey, { environment });
await tx402.payments.processGate({ headers, ... });
```

Credentialed free functions (`resolveServerConfig`, `processPaymentGate`, `facilitatePayment`, `verifyPayment`, `buildPaymentRequired`, `fetchFacilitatorConfig`, `handleFacilitatorConfigRequest`) are no longer public exports.

## License

MIT
