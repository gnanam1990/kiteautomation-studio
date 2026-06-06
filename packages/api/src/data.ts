import {
  createRunFromWorkflow,
  demoAddress,
  demoTxHash,
  replayRun,
  type Approval,
  type Workflow,
  type WorkflowRun,
} from "@kiteautomation/core";

const now = "2026-06-06T02:00:00.000Z";

export const workflows: Workflow[] = [
  {
    id: "wf_transfer_risk",
    name: "High-value transfer guard",
    description: "Watch KiteScan transfers and queue large payments for review.",
    status: "active",
    owner: demoAddress,
    trigger: { id: "tr_kitescan_large_transfer", kind: "kitescan-transfer", label: "KiteScan transfer above threshold", preview: "preview", cursor: "block:174822" },
    conditions: [
      { id: "cond_amount", field: "amount", operator: "greater-than", value: "100" },
      { id: "cond_token", field: "token", operator: "equals", value: "KITE" },
    ],
    decision: { id: "decision_risk", model: "preview-advisory", prompt: "Classify whether this transfer is routine agent spend.", advisoryOnly: true, preview: "preview" },
    actions: [
      { id: "act_approval", kind: "kite-payment", label: "Queue payout approval", target: demoAddress, risk: "high", requiresApproval: true },
      { id: "act_notify", kind: "notify", label: "Notify operator", target: "ops@local", risk: "low", requiresApproval: false },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "wf_webhook_service",
    name: "Service webhook to audit log",
    description: "Accept service webhook events, check metadata, and write a replayable run.",
    status: "active",
    owner: demoAddress,
    trigger: { id: "tr_webhook_service", kind: "webhook", label: "Signed service webhook", preview: "live" },
    conditions: [{ id: "cond_risk", field: "risk", operator: "less-than", value: "3" }],
    actions: [{ id: "act_webhook", kind: "webhook", label: "Forward to internal runbook", target: "https://example.invalid/webhook", risk: "medium", requiresApproval: false }],
    createdAt: now,
    updatedAt: now,
  },
];

export const runs: WorkflowRun[] = [
  createRunFromWorkflow(workflows[0], { amount: "250", token: "KITE", sender: demoAddress, risk: "4" }, new Date("2026-06-06T02:10:00.000Z")),
  {
    ...createRunFromWorkflow(workflows[1], { amount: "1", token: "KITE", sender: demoAddress, risk: "1" }, new Date("2026-06-06T02:20:00.000Z")),
    status: "succeeded",
    completedAt: "2026-06-06T02:20:04.000Z",
    audit: [
      { id: "audit_trigger", at: "2026-06-06T02:20:00.000Z", actor: "trigger", message: "Webhook signature accepted" },
      { id: "audit_forward", at: "2026-06-06T02:20:04.000Z", actor: "executor", message: "Forwarded event to internal runbook", txHash: demoTxHash },
    ],
  },
];

export const approvals: Approval[] = [
  {
    id: "approval_run_transfer",
    runId: runs[0].id,
    actionId: "act_approval",
    status: "pending",
    reason: "Kite payment action is high risk and requires explicit approval.",
    requestedAt: runs[0].startedAt,
  },
];

export function addWorkflow(input: Pick<Workflow, "name" | "description" | "owner">) {
  const workflow: Workflow = {
    id: `wf_${Date.now()}`,
    name: input.name,
    description: input.description,
    status: "draft",
    owner: input.owner,
    trigger: { id: `tr_${Date.now()}`, kind: "webhook", label: "Draft webhook trigger", preview: "preview" },
    conditions: [],
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  workflows.unshift(workflow);
  return workflow;
}

export function testWorkflow(id: string) {
  const workflow = workflows.find((item) => item.id === id);
  if (!workflow) return null;
  const run = createRunFromWorkflow(workflow, { amount: "150", token: "KITE", sender: demoAddress, risk: "3" });
  runs.unshift(run);
  return run;
}

export function replayWorkflowRun(id: string) {
  const run = runs.find((item) => item.id === id);
  if (!run) return null;
  const replayed = replayRun(run);
  runs.unshift(replayed);
  return replayed;
}

