import { createRunFromWorkflow, type Workflow, type WorkflowRun } from "@kiteautomation/core";

export interface RuntimeQueueItem {
  workflow: Workflow;
  input: Record<string, string>;
}

export class AutomationRuntime {
  private queue: RuntimeQueueItem[] = [];
  private history: WorkflowRun[] = [];

  enqueue(item: RuntimeQueueItem) {
    this.queue.push(item);
    return this.queue.length;
  }

  tick(now = new Date()) {
    const item = this.queue.shift();
    if (!item) return null;
    const run = createRunFromWorkflow(item.workflow, item.input, now);
    this.history.unshift(run);
    return run;
  }

  getHistory() {
    return [...this.history];
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("KiteAutomation worker ready. Import AutomationRuntime to enqueue preview jobs.");
}

