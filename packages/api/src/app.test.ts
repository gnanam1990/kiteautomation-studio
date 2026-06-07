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
  it("exposes service metadata on /meta", async () => {
    const response = await app.request("/meta");
    expect(response.status).toBe(200);
    expect((await response.json()).service).toBe("kiteautomation-studio");
  });

  it("returns a chain stats payload for the mainnet network", async () => {
    const response = await app.request("/chain/stats");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.network).toBe("mainnet");
    expect(body.chainId).toBe(2366);
  });

  it("simulates a run through the worker runtime", async () => {
    const response = await app.request("/runs/simulate", { method: "POST" });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.run).toBeTruthy();
    expect(body.preview).toBe(true);
  });

  it("returns JSON 404 for unknown routes", async () => {
    const response = await app.request("/does-not-exist");
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Not found" });
  });
});

