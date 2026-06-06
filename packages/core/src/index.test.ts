import { describe, expect, it } from "vitest";
import {
  actionRequiresApproval,
  createRunFromWorkflow,
  demoAddress,
  evaluateConditions,
  isEvmAddress,
  isTxHash,
  type Workflow,
} from "./index.js";

const workflow: Workflow = {
  id: "wf_payment_guard",
  name: "Large payment approval",
  description: "Queue risky payment actions for human approval.",
  status: "active",
  owner: demoAddress,
  trigger: { id: "tr_1", kind: "webhook", label: "Payment webhook", preview: "live" },
  conditions: [{ id: "cond_1", field: "amount", operator: "greater-than", value: "25" }],
  decision: { id: "dec_1", model: "preview", prompt: "Classify payment risk", advisoryOnly: true, preview: "preview" },
  actions: [{ id: "act_1", kind: "kite-payment", label: "Pay service", target: demoAddress, risk: "high", requiresApproval: true }],
  createdAt: "2026-06-06T00:00:00.000Z",
  updatedAt: "2026-06-06T00:00:00.000Z",
};

describe("core validators", () => {
  it("validates EVM addresses and tx hashes", () => {
    expect(isEvmAddress(demoAddress)).toBe(true);
    expect(isEvmAddress("0x123")).toBe(false);
    expect(isTxHash("0x" + "a".repeat(64))).toBe(true);
  });
});

describe("workflow safety", () => {
  it("requires approval for payment actions", () => {
    expect(actionRequiresApproval(workflow.actions[0])).toBe(true);
  });

  it("evaluates numeric conditions", () => {
    expect(evaluateConditions(workflow.conditions, { amount: "30" })).toBe(true);
    expect(evaluateConditions(workflow.conditions, { amount: "2" })).toBe(false);
  });

  it("creates waiting approval runs for risky workflows", () => {
    const run = createRunFromWorkflow(workflow, { amount: "50", token: "KITE" }, new Date("2026-06-06T01:00:00.000Z"));
    expect(run.status).toBe("waiting-approval");
    expect(run.audit.some((event) => event.actor === "approval")).toBe(true);
  });
});

