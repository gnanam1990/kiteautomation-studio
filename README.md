# KiteAutomation Studio

> A Zapier-style automation studio for Kite: connect on-chain events to safe, approval-gated agent actions.

[![CI](https://github.com/gnanam1990/kiteautomation-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/gnanam1990/kiteautomation-studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

KiteAutomation Studio is a TypeScript pnpm monorepo for building automations that wire
Kite on-chain events to safe, human-reviewed agent actions: triggers, conditions, advisory
decisions, explicit approvals, and replayable runs. It pairs a React frontend with a Hono
API (deployed as a Vercel serverless function) and a pure-TypeScript core that models
workflows, runs, approvals, and risk policy. It is built and run from a staged prompt pack
in [`prompts/`](prompts/).

The design is approval-first: risky or fund-moving actions are gated behind explicit human
approval, and client-submitted claims are never trusted by the backend.

## Features

- **Workflow modelling** — triggers (KiteScan transfer / webhook / schedule), condition
  rules, optional advisory agent-decision step, and risk-ranked actions, all typed in the
  core package.
- **Risk policy & approval gating** — `kite-payment`, high/critical-risk, or
  `requiresApproval` actions are routed to a human approval step before they can proceed.
- **Live Kite Mainnet read** — `GET /api/chain/stats` fetches the current block height over
  JSON-RPC (`viem`) plus gas/network stats from the KiteScan explorer at request time.
- **Worker runtime** — `AutomationRuntime` enqueues and ticks preview run jobs; wired into
  the API at `POST /api/runs/simulate`.
- **Replayable runs** — every run keeps an audit log of trigger, condition, decision,
  approval, executor, and replay events.
- **Graceful degradation** — the frontend renders from bundled preview data if the API is
  unreachable, and the chain endpoint returns a preview-safe payload on infrastructure
  failure rather than erroring.

## Tech stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, lucide-react, TypeScript
- **API:** Hono 4 (`@hono/node-server`, Vercel Node adapter)
- **Chain:** viem (Kite Mainnet / Testnet chains + KiteScan explorer)
- **Build/tooling:** pnpm workspaces, tsx, esbuild, Vitest, TypeScript 5

## Architecture

A pnpm workspace of five packages under `packages/*`:

- **`@kiteautomation/core`** — pure TypeScript domain model: workflow/run/approval types,
  EVM address & tx-hash validation, condition evaluation, risk ranking, and run/replay
  construction. No I/O.
- **`@kiteautomation/connectors`** — viem public clients for Kite Mainnet/Testnet, KiteScan
  URL helpers, a small TTL JSON cache, and a webhook-secret mask. Depends on `viem`.
- **`@kiteautomation/worker`** — `AutomationRuntime`, an in-memory enqueue/tick runtime that
  builds runs via core. Depends on core.
- **`@kiteautomation/api`** — the Hono app and routes, the live chain-stats reader, and
  in-memory demo data. Depends on core, connectors, and worker.
- **`@kiteautomation/web`** — the React + Vite SPA. Calls the API at same-origin `/api` in
  production (or `http://localhost:8787` in local dev) and falls back to bundled preview data.

The `server/index.ts` entry mounts the shared Hono app under `/api` for the Vercel serverless
function.

## Getting started

### Prerequisites

- Node.js 22 (the CI uses Node 22)
- pnpm 9.15.9 (declared via `packageManager`)

### Installation

```bash
pnpm install
```

### Configuration

Copy `.env.example` and adjust as needed. The project reads these variable **names**:

| Variable | Purpose |
| --- | --- |
| `KITE_NETWORK` | Selected Kite network (e.g. `mainnet`). |
| `KITE_MAINNET_RPC` | Kite Mainnet JSON-RPC endpoint. |
| `KITE_MAINNET_API` | KiteScan Mainnet explorer API base. |
| `KITE_TESTNET_RPC` | Kite Testnet JSON-RPC endpoint. |
| `KITE_TESTNET_API` | KiteScan Testnet explorer API base. |
| `API_PORT` | Local API server port (default `8787`). |
| `WEB_ORIGIN` | Allowed CORS origin for the API (default `http://localhost:5173`). |
| `VITE_API_URL` | Frontend API base for local dev; ignored in production (the SPA calls same-origin `/api`). |
| `WEBHOOK_SECRET_DEMO` | Local-only demo webhook secret. |
| `LLM_PROVIDER` | Decision-step provider selector (defaults to `preview`). |

Never commit real secret values.

### Running

```bash
pnpm dev        # runs the API (:8787) and web SPA (:5173) in parallel
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:8787`

```bash
curl http://localhost:8787/health         # { "ok": true, "service": "kiteautomation-studio" }
curl http://localhost:8787/chain/stats    # live Kite Mainnet block height + gas
```

## Usage

The Hono API is mounted at `/api` in production (same-origin) and served at
`http://localhost:8787` in local dev.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Service health probe. |
| GET | `/meta` | Service metadata. |
| GET / POST | `/workflows` | List workflows / create a workflow. |
| GET | `/workflows/:id` | Fetch a workflow. |
| POST | `/workflows/:id/test` | Test-run a workflow (preview). |
| GET | `/runs` | Run log. |
| POST | `/runs/:id/replay` | Replay a run. |
| POST | `/runs/simulate` | Simulate a run through the worker runtime. |
| GET | `/approvals` | Approvals inbox. |
| POST | `/approvals/:id/approve` · `/deny` | Resolve an approval (server-side demo state). |
| GET | `/chain/stats` | Live Kite Mainnet block height + gas. |
| POST | `/webhooks/:triggerId` | Preview webhook intake. |

## Testing

```bash
pnpm -r typecheck                        # typecheck every package
pnpm -r test                             # run Vitest across all packages
pnpm --filter @kiteautomation/web build  # production web build
```

Tests cover the core domain logic (`packages/core`), the API routes including the chain and
worker-backed endpoints (`packages/api`), and the worker runtime (`packages/worker`). The
connectors and web packages run with `--passWithNoTests`.

## Project structure

```
packages/
  core/        domain model, validation, condition/risk/run logic
  connectors/  viem Kite clients + KiteScan helpers
  worker/      AutomationRuntime
  api/         Hono app, routes, chain reader, demo data
  web/         React + Vite SPA
server/        Vercel serverless function entry (mounts api under /api)
scripts/       vercel-build.mjs (Build Output API)
docs/          proof-of-work notes and screenshot
prompts/       staged prompt pack used to build the repo
```

## Status

Preview / demo-stage. The pieces below are real and verified in source:

- React + Vite SPA, the Hono API (deployable as a Vercel serverless function), the pure
  TypeScript core, the worker runtime, and the connectors package.
- The live Kite Mainnet read at `GET /api/chain/stats` (viem JSON-RPC + KiteScan).
- Tests for core, API, and worker.

Preview / by-design limitations:

- API demo data (workflows, runs, approvals) is held in memory and is not persisted; the
  serverless function is stateless.
- In the frontend, approve/deny updates **local React state only** by design — it does not
  call the API. Workflows created via the UI are merged from `localStorage`.
- Agent decisions are advisory-only and are never auto-executed. Payment verification and
  fund movement are preview-safe; fund-moving or risky actions require explicit approval, and
  client-submitted payment claims are not trusted.
- Webhook intake is a preview runtime; production secrets must be supplied via environment
  variables only.

## Deployment

Vercel builds `main` via the Build Output API (`scripts/vercel-build.mjs`): the SPA is served
statically and `server/index.ts` is esbuild-bundled into a self-contained `/api` serverless
function. The frontend calls same-origin `/api` in production and falls back to bundled
preview data on any error.

## License

[MIT](LICENSE) © 2026 Gnanam (gnanam1990)
