# `@transx402/server`

IDRX x402 **merchant backend** helpers. Use with [`@transx402/client`](https://www.npmjs.com/package/@transx402/client) in **`settlement: 'server'`** mode (canonical x402): the browser signs; your server calls `POST /facilitate`.

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

1. Client `fetch()` hits your API → you return **402** + `buildPaymentRequired(...)`
2. Client wallet signs → retries with `PAYMENT-SIGNATURE`
3. Your Route Handler calls `facilitatePayment` / `processPaymentGate` → `POST /facilitate` with server `X-API-Key`
4. On success, return paid content

Keep `ipk_` API keys on the **server** for this mode. For paywall / static sites without a merchant API, use `@transx402/client` **`settlement: 'direct'`** instead.

## Quick start (Next.js Route Handler)

```ts
import {
  processPaymentGate,
  resolveServerConfig,
} from "@transx402/server";

const apiKey = process.env.TRANSX402_API_KEY!;
const { facilitatorUrl, configSection } = resolveServerConfig({
  apiKey,
  environment: "local", // or "camp" | "base"
});

export async function GET(request: Request) {
  const gate = await processPaymentGate({
    headers: request.headers,
    facilitatorUrl,
    apiKey,
    configSection,
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

Pair with the browser client:

```ts
import { createBrowserClient } from "@transx402/client/browser";

const client = createBrowserClient({
  apiKey: "ipk_sandbox_...", // not needed for server settlement; omit or use publishable key only for direct mode
  environment: "local",
  settlement: "server", // default for fetch()
});

await client.fetch("/api/premium");
```

## API

| Export | Purpose |
|--------|---------|
| `buildPaymentRequired` | Build x402 v2 402 JSON from facilitator `/config` |
| `facilitatePayment` | Decode header → `POST /facilitate` |
| `processPaymentGate` | No header → 402; header → facilitate |
| `hasPaymentHeader` / `getPaymentHeader` | Read `PAYMENT-SIGNATURE` / `X-PAYMENT` |
| `decodePaymentSignature` | Base64 JSON decode of payment payload |
| `verifyPayment` | Post-settlement `GET /payments/:txHash` (requires API key) |
| `toIdrxBaseUnits` | Whole IDR → IDRX base units (×100) |
| `resolveServerConfig` / `FACILITATOR_PRESETS` | Facilitator URL + sandbox/production section |

## License

MIT
