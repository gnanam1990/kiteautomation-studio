export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused";
  owner: string;
  trigger: { label: string; kind: string; preview: string; cursor?: string };
  conditions: Array<{ id: string; field: string; operator: string; value: string }>;
  actions: Array<{ id: string; kind: string; label: string; target: string; risk: string; requiresApproval: boolean }>;
}

export interface Run {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  risk: string;
  audit: Array<{ id: string; actor: string; message: string; at: string; preview?: string }>;
}

export interface Approval {
  id: string;
  runId: string;
  actionId: string;
  status: string;
  reason: string;
  requestedAt: string;
}

const configuredApiBase = (import.meta.env.VITE_API_URL ?? "").trim();
const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);
const isLocalPage = typeof window !== "undefined" && localHostnames.has(window.location.hostname);

// In production the SPA and the API live on the same Vercel deployment, so the
// API is reachable at the same-origin "/api" path. Locally we hit the dev server
// on :8787. A localhost VITE_API_URL baked into a production build is meaningless,
// so it falls back to "/api" rather than silently using only bundled data.
function resolveApiBase(value: string) {
  if (!value) return isLocalPage ? "http://localhost:8787" : "/api";
  try {
    const url = new URL(value);
    if (localHostnames.has(url.hostname) && !isLocalPage) return "/api";
    return value.replace(/\/$/, "");
  } catch {
    return value.startsWith("/") ? value.replace(/\/$/, "") : "/api";
  }
}

const apiBase = resolveApiBase(configuredApiBase);

async function getJson<T>(path: string, fallback: T): Promise<T> {
  if (!apiBase) return fallback;
  try {
    const response = await fetch(`${apiBase}${path}`);
    if (!response.ok) throw new Error(String(response.status));
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export const fallbackWorkflows: Workflow[] = [
  {
    id: "wf_transfer_risk",
    name: "High-value transfer guard",
    description: "Watch KiteScan transfers and queue large payments for review.",
    status: "active",
    owner: "0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043",
    trigger: { label: "KiteScan transfer above threshold", kind: "kitescan-transfer", preview: "preview", cursor: "block:174822" },
    conditions: [
      { id: "cond_amount", field: "amount", operator: "greater-than", value: "100" },
      { id: "cond_token", field: "token", operator: "equals", value: "KITE" },
    ],
    actions: [
      { id: "act_approval", kind: "kite-payment", label: "Queue payout approval", target: "operator", risk: "high", requiresApproval: true },
      { id: "act_notify", kind: "notify", label: "Notify operator", target: "ops", risk: "low", requiresApproval: false },
    ],
  },
  {
    id: "wf_webhook_service",
    name: "Service webhook to audit log",
    description: "Accept service webhook events, check metadata, and write a replayable run.",
    status: "active",
    owner: "0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043",
    trigger: { label: "Signed service webhook", kind: "webhook", preview: "live" },
    conditions: [{ id: "cond_risk", field: "risk", operator: "less-than", value: "3" }],
    actions: [{ id: "act_webhook", kind: "webhook", label: "Forward to runbook", target: "internal", risk: "medium", requiresApproval: false }],
  },
];

export const fallbackRuns: Run[] = [
  {
    id: "run_transfer_guard",
    workflowId: "wf_transfer_risk",
    status: "waiting-approval",
    startedAt: "2026-06-06T02:10:00.000Z",
    risk: "high",
    audit: [
      { id: "a1", actor: "trigger", message: "KiteScan transfer event received", at: "2026-06-06T02:10:00.000Z", preview: "preview" },
      { id: "a2", actor: "approval", message: "Risky action queued for explicit approval", at: "2026-06-06T02:10:01.000Z" },
    ],
  },
  {
    id: "run_service_webhook",
    workflowId: "wf_webhook_service",
    status: "succeeded",
    startedAt: "2026-06-06T02:20:00.000Z",
    risk: "medium",
    audit: [{ id: "a3", actor: "executor", message: "Forwarded event to runbook", at: "2026-06-06T02:20:04.000Z" }],
  },
];

export const fallbackApprovals: Approval[] = [
  {
    id: "approval_run_transfer",
    runId: "run_transfer_guard",
    actionId: "act_approval",
    status: "pending",
    reason: "Kite payment action is high risk and requires explicit approval.",
    requestedAt: "2026-06-06T02:10:00.000Z",
  },
];

// The serverless API is stateless, so workflows created in the UI are also kept
// in localStorage and merged into the list. This makes the create flow actually
// complete: a new workflow shows up in the list and survives a reload.
const createdKey = "kite:created:kiteautomation-studio";

function loadCreated(): Workflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(createdKey);
    return raw ? (JSON.parse(raw) as Workflow[]) : [];
  } catch {
    return [];
  }
}

function rememberCreated(workflow: Workflow) {
  if (typeof window === "undefined") return;
  try {
    const next = [workflow, ...loadCreated().filter((entry) => entry.id !== workflow.id)].slice(0, 25);
    window.localStorage.setItem(createdKey, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, quota) — non-fatal.
  }
}

export async function fetchWorkflows() {
  const created = loadCreated();
  const result = await getJson<{ workflows: Workflow[] }>("/workflows", { workflows: fallbackWorkflows });
  const ids = new Set(result.workflows.map((workflow) => workflow.id));
  return { workflows: [...created.filter((workflow) => !ids.has(workflow.id)), ...result.workflows] };
}

export async function createWorkflow(input: { name: string; description: string; owner: string }): Promise<Workflow> {
  if (!apiBase) throw new Error("API is not configured");
  const response = await fetch(`${apiBase}/workflows`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await response.json().catch(() => ({}))) as { workflow?: Workflow; error?: string };
  if (!response.ok) throw new Error(data.error ?? `Create failed (${response.status})`);
  if (!data.workflow) throw new Error("Malformed response from API");
  rememberCreated(data.workflow);
  return data.workflow;
}

export function fetchRuns() {
  return getJson<{ runs: Run[] }>("/runs", { runs: fallbackRuns });
}

export function fetchApprovals() {
  return getJson<{ approvals: Approval[] }>("/approvals", { approvals: fallbackApprovals });
}

export interface ChainStats {
  network: string;
  chainId: number;
  blockNumber?: number;
  gasPrices?: { slow: number; average: number; fast: number };
  live: boolean;
  preview: boolean;
}

export function fetchChainStats() {
  return getJson<ChainStats>("/chain/stats", { network: "mainnet", chainId: 2366, live: false, preview: true });
}
