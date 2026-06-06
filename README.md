# KiteAutomation Studio

KiteAutomation Studio is a Zapier-style automation workspace for Kite AI agents. It gives builders a single place to define on-chain triggers, conditions, advisory agent decisions, approval-gated actions, retries, and audit logs.

This repository is built from the staged OpenCode prompt pack in `prompts/`.

## Proof of Work

- Live Vercel deployment: https://kiteautomation-studio.vercel.app
- Public proof report: [docs/PROOF_OF_WORK.md](docs/PROOF_OF_WORK.md)
- Rendered screenshot: [docs/screenshot.jpg](docs/screenshot.jpg)

## What is real

- Vite + React + TypeScript frontend with all required product routes.
- Hono API with workflow, run, approval, replay, webhook, and health endpoints.
- Pure TypeScript workflow engine in `packages/core`.
- Worker runtime simulation in `packages/worker`.
- Kite constants, KiteScan helper, cached fetch, and RPC helper in `packages/connectors`.
- Tests for validation, workflow safety, API routes, and worker execution.

## What is PREVIEW

- Agent decisions are advisory and seeded locally.
- Payment and fund-moving actions always require explicit approval and are not auto-executed.
- Webhook encryption is represented by env-only secret handling in this MVP.
- KiteScan/RPC connectors are provided, but this app does not claim official contract integrations.

## Structure

```txt
packages/web/          Vite + React 19 frontend
packages/api/          Hono API server
packages/worker/       background jobs and runtime simulation
packages/core/         pure TypeScript workflow domain logic
packages/connectors/   KiteScan, RPC, webhook, LLM, wallet/API connectors
```

## Run locally

```bash
pnpm install
pnpm dev
```

Frontend: `http://localhost:5173`

API: `http://localhost:8787`

Health check:

```bash
curl http://localhost:8787/health
```

Expected:

```json
{ "ok": true, "service": "kiteautomation-studio" }
```

## Verification

```bash
pnpm -r typecheck
pnpm -r lint
pnpm -r test
grep -rn "Instrument\|font-instrument\|font-serif" packages/web/src packages/web/index.html
grep -rn "violet\|indigo\|cyan\|#7C3AED\|#4F46E5\|#06B6D4" packages/web/src
```

The two grep commands should return zero hits.

## Safety model

- Client-submitted payment claims are never trusted.
- Any fund-moving action is marked `requiresApproval`.
- Every workflow run records an audit trail.
- LLM steps are advisory unless approved.
- PREVIEW labels are shown for incomplete, simulated, unaudited, or heuristic features.

