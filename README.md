# KiteAutomation Studio

[![CI](https://github.com/gnanam1990/kiteautomation-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/gnanam1990/kiteautomation-studio/actions/workflows/ci.yml)

Zapier-style automation studio for Kite AI agent workflows.

This repository is built from the staged prompt pack in [`prompts/`](prompts/).

## Product promise

Build automations that connect Kite on-chain events to safe, approval-gated agent actions:
triggers, conditions, advisory decisions, explicit approvals, and replayable runs.

## Live

- App: https://kiteautomation-studio.vercel.app
- API: https://kiteautomation-studio.vercel.app/api/health
- Live chain read: https://kiteautomation-studio.vercel.app/api/chain/stats
- Proof report: [docs/PROOF_OF_WORK.md](docs/PROOF_OF_WORK.md) · screenshot: [docs/screenshot.jpg](docs/screenshot.jpg)

## What is real

- Vite + React 19 + TypeScript frontend with workflows, runs, approvals, connectors, and settings.
- Hono API **deployed live** as a Vercel Serverless Function at `/api` (not just local dev).
- **Real Kite Mainnet read** at `GET /api/chain/stats` — live block height over JSON-RPC (`viem`) plus
  gas/network stats from the KiteScan explorer, surfaced in the app's live-network strip.
- Pure TypeScript core for Kite-safe validation, run/approval modelling, and risk policy.
- `AutomationRuntime` worker wired into the live API at `POST /api/runs/simulate`.
- Tests for core, API routes (incl. chain + worker), and worker execution.

## What is PREVIEW

- The app degrades gracefully: if the live API is unreachable, the frontend renders from bundled preview data.
- Agentic decisions, payment verification, and fund movement are preview-safe unless verified by backend code.
- Client-submitted payment claims are not trusted. Fund-moving or risky actions require explicit approval.

## API endpoints

Base path in production is `/api` (same-origin); base path in local dev is `http://localhost:8787`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Service health probe. |
| GET | `/meta` | Service metadata. |
| GET | `/workflows` · POST | List / create workflows. |
| GET | `/workflows/:id` | Fetch a workflow. |
| POST | `/workflows/:id/test` | Test-run a workflow (preview). |
| GET | `/runs` | Run log. |
| POST | `/runs/:id/replay` | Replay a run. |
| POST | `/runs/simulate` | Simulate a run through the worker runtime. |
| GET | `/approvals` · POST `/:id/approve`·`/deny` | Approvals inbox. |
| GET | `/chain/stats` | **Live** Kite Mainnet block height + gas. |
| POST | `/webhooks/:triggerId` | Preview webhook intake. |

## Run locally

```bash
pnpm install
pnpm dev
```

Frontend: `http://localhost:5173` · API: `http://localhost:8787`

```bash
curl http://localhost:8787/health         # { "ok": true, "service": "kiteautomation-studio" }
curl http://localhost:8787/chain/stats     # live Kite Mainnet block height + gas
```

## Verification

```bash
pnpm -r typecheck
pnpm -r test
pnpm --filter @kiteautomation/web build
```

## Deployment

Vercel auto-deploys `main` via the Build Output API (`scripts/vercel-build.mjs`): the SPA is served
statically and `server/index.ts` is esbuild-bundled into a self-contained `/api` serverless function.
The frontend calls same-origin `/api` in production and falls back to bundled preview data on any error.

## License

[MIT](LICENSE) © 2026 Gnanam (gnanam1990)
