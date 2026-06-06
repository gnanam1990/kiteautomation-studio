import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("api", () => {
  it("returns health", async () => {
    const response = await app.request("/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, service: "kiteautomation-studio" });
  });

  it("lists workflows and runs", async () => {
    const workflows = await app.request("/workflows");
    const runs = await app.request("/runs");
    expect(workflows.status).toBe(200);
    expect(runs.status).toBe(200);
    expect((await workflows.json()).workflows.length).toBeGreaterThan(0);
    expect((await runs.json()).runs.length).toBeGreaterThan(0);
  });

  it("creates replay runs", async () => {
    const runsResponse = await app.request("/runs");
    const runId = (await runsResponse.json()).runs[0].id;
    const replay = await app.request(`/runs/${runId}/replay`, { method: "POST" });
    expect(replay.status).toBe(201);
    expect((await replay.json()).run.status).toBe("queued");
  });
});

