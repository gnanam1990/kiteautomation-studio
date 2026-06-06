export type KiteAddress = `0x${string}`;
export type TxHash = `0x${string}`;
export type ISODate = string;
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type PreviewStatus = "live" | "preview" | "estimated" | "coming-v0.2";
export type WorkflowStatus = "draft" | "active" | "paused";
export type RunStatus = "queued" | "running" | "waiting-approval" | "succeeded" | "failed";
export type ApprovalStatus = "pending" | "approved" | "denied";

export interface Trigger {
  id: string;
  kind: "kitescan-transfer" | "webhook" | "schedule";
  label: string;
  preview: PreviewStatus;
  cursor?: string;
}

export interface ConditionRule {
  id: string;
  field: "amount" | "token" | "sender" | "risk";
  operator: "equals" | "contains" | "greater-than" | "less-than";
  value: string;
}

export interface AgentDecisionStep {
  id: string;
  model: string;
  prompt: string;
  advisoryOnly: true;
  preview: PreviewStatus;
}

export interface WorkflowAction {
  id: string;
  kind: "webhook" | "notify" | "kite-payment" | "pause-agent";
  label: string;
  target: string;
  risk: RiskLevel;
  requiresApproval: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  owner: KiteAddress;
  trigger: Trigger;
  conditions: ConditionRule[];
  decision?: AgentDecisionStep;
  actions: WorkflowAction[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface AuditEvent {
  id: string;
  at: ISODate;
  actor: "trigger" | "condition" | "agent" | "approval" | "executor" | "system";
  message: string;
  preview?: PreviewStatus;
  txHash?: TxHash;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: RunStatus;
  startedAt: ISODate;
  completedAt?: ISODate;
  input: Record<string, string>;
  risk: RiskLevel;
  audit: AuditEvent[];
}

export interface Approval {
  id: string;
  runId: string;
  actionId: string;
  status: ApprovalStatus;
  reason: string;
  requestedAt: ISODate;
  decidedAt?: ISODate;
}

const evmAddressPattern = /^0x[a-fA-F0-9]{40}$/;
const txHashPattern = /^0x[a-fA-F0-9]{64}$/;

export function isEvmAddress(value: string): value is KiteAddress {
  return evmAddressPattern.test(value);
}

export function isTxHash(value: string): value is TxHash {
  return txHashPattern.test(value);
}

export function assertEvmAddress(value: string): KiteAddress {
  if (!isEvmAddress(value)) {
    throw new Error(`Invalid Kite/EVM address: ${value}`);
  }
  return value;
}

export function assertTxHash(value: string): TxHash {
  if (!isTxHash(value)) {
    throw new Error(`Invalid transaction hash: ${value}`);
  }
  return value;
}

export function actionRequiresApproval(action: Pick<WorkflowAction, "kind" | "risk" | "requiresApproval">) {
  return action.requiresApproval || action.kind === "kite-payment" || action.risk === "high" || action.risk === "critical";
}

export function highestRisk(actions: WorkflowAction[]): RiskLevel {
  const rank: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  return actions.reduce<RiskLevel>((current, action) => (rank[action.risk] > rank[current] ? action.risk : current), "low");
}

export function evaluateCondition(rule: ConditionRule, input: Record<string, string>) {
  const actual = input[rule.field] ?? "";
  if (rule.operator === "equals") return actual === rule.value;
  if (rule.operator === "contains") return actual.includes(rule.value);
  const actualNumber = Number(actual);
  const expectedNumber = Number(rule.value);
  if (Number.isNaN(actualNumber) || Number.isNaN(expectedNumber)) return false;
  if (rule.operator === "greater-than") return actualNumber > expectedNumber;
  return actualNumber < expectedNumber;
}

export function evaluateConditions(rules: ConditionRule[], input: Record<string, string>) {
  return rules.every((rule) => evaluateCondition(rule, input));
}

export function createRunFromWorkflow(workflow: Workflow, input: Record<string, string>, now = new Date()): WorkflowRun {
  const conditionsPass = evaluateConditions(workflow.conditions, input);
  const approvalNeeded = workflow.actions.some(actionRequiresApproval);
  const status: RunStatus = !conditionsPass ? "failed" : approvalNeeded ? "waiting-approval" : "succeeded";
  const startedAt = now.toISOString();
  const audit: AuditEvent[] = [
    { id: `${workflow.id}-trigger`, at: startedAt, actor: "trigger", message: `${workflow.trigger.label} received event`, preview: workflow.trigger.preview },
    { id: `${workflow.id}-conditions`, at: startedAt, actor: "condition", message: conditionsPass ? "All conditions passed" : "Condition check failed" },
  ];

  if (workflow.decision) {
    audit.push({
      id: `${workflow.id}-decision`,
      at: startedAt,
      actor: "agent",
      message: "Agent decision step produced advisory output and is not auto-executed",
      preview: workflow.decision.preview,
    });
  }

  audit.push({
    id: `${workflow.id}-executor`,
    at: startedAt,
    actor: approvalNeeded ? "approval" : "executor",
    message: approvalNeeded ? "Risky action queued for human approval" : "Safe actions executed in preview runtime",
    preview: approvalNeeded ? "preview" : undefined,
  });

  return {
    id: `run_${workflow.id}_${now.getTime()}`,
    workflowId: workflow.id,
    status,
    startedAt,
    completedAt: status === "succeeded" || status === "failed" ? startedAt : undefined,
    input,
    risk: highestRisk(workflow.actions),
    audit,
  };
}

export function replayRun(run: WorkflowRun, now = new Date()): WorkflowRun {
  return {
    ...run,
    id: `${run.id}_replay_${now.getTime()}`,
    status: "queued",
    startedAt: now.toISOString(),
    completedAt: undefined,
    audit: [
      ...run.audit,
      {
        id: `${run.id}-replay`,
        at: now.toISOString(),
        actor: "system",
        message: "Replay queued from audit log",
        preview: "preview",
      },
    ],
  };
}

export const demoAddress = assertEvmAddress("0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043");
export const demoTxHash = assertTxHash("0x1111111111111111111111111111111111111111111111111111111111111111");

