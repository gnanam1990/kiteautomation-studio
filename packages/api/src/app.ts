import { Hono } from "hono";
import { cors } from "hono/cors";
import { assertEvmAddress } from "@kiteautomation/core";
import { addWorkflow, approvals, replayWorkflowRun, runs, testWorkflow, workflows } from "./data.js";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: [process.env.WEB_ORIGIN ?? "http://localhost:5173"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ ok: true, service: "kiteautomation-studio" }));

app.get("/workflows", (c) => c.json({ workflows }));

app.post("/workflows", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { name?: string; description?: string; owner?: string } | null;
  if (!body?.name || !body.description || !body.owner) return c.json({ error: "name, description, and owner are required" }, 400);
  try {
    return c.json({ workflow: addWorkflow({ name: body.name, description: body.description, owner: assertEvmAddress(body.owner) }) }, 201);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Invalid workflow" }, 400);
  }
});

app.get("/workflows/:id", (c) => {
  const workflow = workflows.find((item) => item.id === c.req.param("id"));
  if (!workflow) return c.json({ error: "Workflow not found" }, 404);
  return c.json({ workflow });
});

app.post("/workflows/:id/test", (c) => {
  const run = testWorkflow(c.req.param("id"));
  if (!run) return c.json({ error: "Workflow not found" }, 404);
  return c.json({ run }, 201);
});

app.get("/runs", (c) => c.json({ runs }));

app.post("/runs/:id/replay", (c) => {
  const run = replayWorkflowRun(c.req.param("id"));
  if (!run) return c.json({ error: "Run not found" }, 404);
  return c.json({ run }, 201);
});

app.get("/approvals", (c) => c.json({ approvals }));

app.post("/approvals/:id/approve", (c) => {
  const approval = approvals.find((item) => item.id === c.req.param("id"));
  if (!approval) return c.json({ error: "Approval not found" }, 404);
  approval.status = "approved";
  approval.decidedAt = new Date().toISOString();
  return c.json({ approval });
});

app.post("/approvals/:id/deny", (c) => {
  const approval = approvals.find((item) => item.id === c.req.param("id"));
  if (!approval) return c.json({ error: "Approval not found" }, 404);
  approval.status = "denied";
  approval.decidedAt = new Date().toISOString();
  return c.json({ approval });
});

app.post("/webhooks/:triggerId", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, string>;
  return c.json({
    accepted: true,
    triggerId: c.req.param("triggerId"),
    preview: true,
    message: "Webhook accepted into preview runtime. Production secrets must be env-only.",
    receivedKeys: Object.keys(body),
  });
});

