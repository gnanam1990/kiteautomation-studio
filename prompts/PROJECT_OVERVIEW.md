# KiteAutomation Studio — Project Prompt Pack

## One-line summary
Zapier/n8n-style automation studio for Kite AI agents.

## Product positioning
Build automations for the agent economy: on-chain triggers, conditions, agent decisions, human approvals, Kite payments, webhooks, retries, and audit logs.

## Why this exists
Kite builders currently need to manually wire KiteScan polling, webhook logic, payment verification, approvals, retries, and agent prompts. This product becomes the workflow automation layer for Kite AI.

## Repository name
`kiteautomation-studio`

## Header subtitle
`AUTOMATION`

## Core routes
- `/`
- `/workflows`
- `/workflows/new`
- `/workflows/:id`
- `/runs`
- `/connectors`
- `/approvals`
- `/settings`


## Core modules
1. **Trigger Engine** — Detect on-chain and off-chain events and start workflow runs.
2. **Condition Builder** — Visual rule engine for deciding whether a workflow continues.
3. **Agent Decision Step** — Optional LLM decision step that classifies events and proposes actions.
4. **Action Executor** — Executes safe actions and queues risky/fund-moving actions for approval.
5. **Audit Log + Replay** — Inspectable history of every workflow run and replay support.

## API surface
- `GET /workflows`
- `POST /workflows`
- `GET /workflows/:id`
- `POST /workflows/:id/test`
- `POST /runs/:id/replay`
- `GET /runs`
- `POST /approvals/:id/approve`
- `POST /approvals/:id/deny`
- `POST /webhooks/:triggerId`


## Safety requirements
- Payment actions require explicit approval
- Webhook secrets are encrypted or env-only
- Polling cursors prevent duplicate execution
- All LLM decisions are advisory unless approved
- PREVIEW badge on polling/websocket limitations


## Build philosophy
This is not a small demo. Build it as a serious productivity platform for Kite AI agents. Every UI screen must move the user toward a real workflow, decision, payment, approval, or operational outcome.
