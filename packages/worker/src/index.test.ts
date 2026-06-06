import { describe, expect, it } from "vitest";
import { demoAddress, type Workflow } from "@kiteautomation/core";
import { AutomationRuntime } from "./index.js";

const workflow: Workflow = {
  id: "wf_worker",
  name: "Worker smoke workflow",
  description: "Preview worker run.",
  status: "active",
  owner: demoAddress,
  trigger: { id: "tr_worker", kind: "schedule", label: "Every 5 minutes", preview: "preview" },
  conditions: [],
  actions: [{ id: "act_notify", kind: "notify", label: "Notify", target: "local", risk: "low", requiresApproval: false }],
  createdAt: "2026-06-06T00:00:00.000Z",
  updatedAt: "2026-06-06T00:00:00.000Z",
};

describe("AutomationRuntime", () => {
  it("runs queued preview jobs", () => {
    const runtime = new AutomationRuntime();
    expect(runtime.enqueue({ workflow, input: { amount: "1" } })).toBe(1);
    const run = runtime.tick(new Date("2026-06-06T03:00:00.000Z"));
    expect(run?.status).toBe("succeeded");
    expect(runtime.getHistory()).toHaveLength(1);
  });
});

