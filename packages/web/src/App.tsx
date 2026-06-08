import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitBranch,
  KeyRound,
  Play,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import kiteMark from "./assets/brand/kite-logo-mark-black.png";
import { createWorkflow, fallbackApprovals, fallbackRuns, fallbackWorkflows, fetchApprovals, fetchRuns, fetchWorkflows, type Approval, type Run, type Workflow, fetchChainStats, type ChainStats } from "./lib/api";

function cx(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function StatusPill({ value }: { value: string }) {
  const good = ["active", "succeeded", "approved", "live", "safe"].includes(value);
  const risk = ["waiting-approval", "pending", "high"].includes(value);
  return <span className={cx("inline-flex rounded px-2.5 py-1 text-xs font-bold uppercase", good && "bg-[#e4eadf] text-[#45543f]", risk && "bg-[#ead9d0] text-kite-rust", !good && !risk && "bg-secondary text-muted-foreground")}>{value}</span>;
}

function BrandLockup() {
  return (
    <a className="flex items-center gap-3" href="/" aria-label="KiteAutomation Studio">
      <img className="h-10 w-10 object-contain" src={kiteMark} alt="Kite logo mark" />
      <div><div className="kite-brand-word text-lg font-bold text-kite-brown">KiteAutomation Studio</div><div className="text-xs font-bold uppercase text-muted-foreground">AUTOMATION</div></div>
    </a>
  );
}

function Shell({ children, activePath }: { children: ReactNode; activePath: string }) {
  const links = [["/", "Canvas"], ["/workflows", "Workflows"], ["/runs", "Runs"], ["/connectors", "Connectors"], ["/approvals", "Approvals"], ["/settings", "Settings"]];
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <BrandLockup />
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(([href, label]) => <a key={href} href={href} className={cx("rounded-lg px-3 py-2 text-sm font-bold", activePath === href ? "bg-secondary text-kite-brown" : "text-muted-foreground hover:bg-secondary")}>{label}</a>)}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-7">{children}</main>
    </div>
  );
}

function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" }) {
  return <a href={href} className={cx("inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold", variant === "primary" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-kite-brown")}>{children}</a>;
}

function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={cx("rounded-lg border border-border bg-card p-5", className)}>{children}</section>;
}

function SectionTitle({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground"><Icon size={18} /> Workflow canvas</div>
      <h1 className="max-w-4xl text-4xl font-bold leading-none text-kite-brown sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{body}</p>
    </div>
  );
}

function WorkflowNode({ title, body, icon: Icon, status }: { title: string; body: string; icon: LucideIcon; status: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kite-brown text-kite-cream"><Icon size={18} /></div>
          <div><p className="font-bold text-kite-brown">{title}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{body}</p></div>
        </div>
        <StatusPill value={status} />
      </div>
    </div>
  );
}

function HomePage({ workflows, runs, approvals }: { workflows: Workflow[]; runs: Run[]; approvals: Approval[] }) {
  const selected = workflows[0];
  return (
    <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <section className="rounded-lg border border-border bg-card p-6">
        <SectionTitle icon={GitBranch} title="Automation canvas for the Kite agent economy." body="Build event-driven workflows with trigger rules, policy gates, advisory decisions, and explicit approvals before risky execution." />
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/workflows/new"><Play size={16} /> New workflow</ButtonLink>
          <ButtonLink href="/runs" variant="secondary"><Activity size={16} /> Inspect runs</ButtonLink>
        </div>
        <div className="mt-7 grid gap-3">
          {workflows.map((workflow) => (
            <a key={workflow.id} href={`/workflows/${workflow.id}`} className="rounded-lg border border-border bg-secondary p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-bold text-kite-brown">{workflow.name}</p><StatusPill value={workflow.status} /></div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="grid gap-5">
        <Surface className="bg-secondary">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-xs font-bold uppercase text-muted-foreground">Selected workflow</p><h2 className="mt-1 text-2xl font-bold text-kite-brown">{selected.name}</h2></div>
            <div className="flex gap-2"><StatusPill value={selected.status} /><StatusPill value={approvals.length ? "pending" : "safe"} /></div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <WorkflowNode title="Trigger" body={selected.trigger.label} icon={Webhook} status={selected.trigger.preview} />
            <WorkflowNode title="Conditions" body={`${selected.conditions.length} rules before action`} icon={SlidersHorizontal} status="policy" />
            <WorkflowNode title="Decision" body="Advisory agent output recorded for audit." icon={Activity} status="preview" />
            <WorkflowNode title="Executor" body={`${selected.actions.length} actions with approval gates`} icon={ShieldCheck} status="safe" />
          </div>
        </Surface>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <Surface>
            <h2 className="text-2xl font-bold text-kite-brown">Run timeline</h2>
            <div className="mt-4 grid gap-3">
              {runs.map((run) => <div key={run.id} className="rounded border border-border bg-secondary p-3"><div className="flex items-center justify-between"><span className="font-mono text-sm text-kite-brown">{run.id}</span><StatusPill value={run.status} /></div><p className="mt-2 text-sm text-muted-foreground">{run.audit[0]?.message}</p></div>)}
            </div>
          </Surface>
          <Surface>
            <h2 className="text-2xl font-bold text-kite-brown">Approval queue</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{approvals.length ? approvals[0].reason : "No risky actions waiting."}</p>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded bg-secondary p-3"><p className="text-xs font-bold uppercase text-muted-foreground">Runs</p><p className="text-2xl font-bold text-kite-brown">{runs.length}</p></div><div className="rounded bg-secondary p-3"><p className="text-xs font-bold uppercase text-muted-foreground">Chain</p><p className="text-2xl font-bold text-kite-brown">2366</p></div></div>
          </Surface>
        </div>
      </section>
    </div>
  );
}

function WorkflowsPage({ workflows }: { workflows: Workflow[] }) {
  return <div className="grid gap-5"><SectionTitle icon={GitBranch} title="Workflows" body="Create, test, pause, and inspect automations that connect Kite events to safe agent actions." /><div className="grid gap-4">{workflows.map((workflow) => <Surface key={workflow.id}><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold text-kite-brown">{workflow.name}</h2><StatusPill value={workflow.status} /></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.description}</p></div><ButtonLink href={`/workflows/${workflow.id}`} variant="secondary">Open</ButtonLink></div></Surface>)}</div></div>;
}

function NewWorkflowPage() {
  const [name, setName] = useState("Agent service payment monitor");
  const [description, setDescription] = useState("When a KITE payment is above policy threshold, classify risk and queue explicit human approval.");
  const [owner, setOwner] = useState("0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043");
  const [state, setState] = useState<{ kind: "idle" | "saving" | "ok" | "error"; message?: string; workflow?: Workflow }>({ kind: "idle" });
  const fieldClass = "mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-kite-brown";

  async function submit() {
    if (!name.trim() || !description.trim() || !owner.trim()) {
      setState({ kind: "error", message: "Name, description, and owner are required." });
      return;
    }
    setState({ kind: "saving" });
    try {
      const workflow = await createWorkflow({ name, description, owner });
      setState({ kind: "ok", workflow });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Create failed" });
    }
  }

  return (
    <div className="grid gap-5">
      <a href="/workflows" className="text-sm font-bold text-muted-foreground">&larr; Back to workflows</a>
      <SectionTitle icon={Play} title="New workflow" body="Draft the workflow, owner, and description. Submitting posts to the live API." />
      <Surface>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-kite-brown">Workflow name<input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="text-sm font-bold text-kite-brown">Owner (EVM address)<input className={`${fieldClass} font-mono`} value={owner} onChange={(e) => setOwner(e.target.value)} /></label>
        </div>
        <label className="mt-4 block text-sm font-bold text-kite-brown">Description<textarea className={`${fieldClass} min-h-28`} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={submit} disabled={state.kind === "saving"} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
            {state.kind === "saving" ? "Creating…" : "Create workflow"}
          </button>
          {state.kind === "ok" && <span className="text-sm font-bold text-[#45543f]">✓ Created {state.workflow?.name} ({state.workflow?.id}) — <a className="underline" href="/workflows">view all</a></span>}
          {state.kind === "error" && <span className="text-sm font-bold text-kite-rust">{state.message}</span>}
        </div>
      </Surface>
    </div>
  );
}

function WorkflowDetailPage({ workflows }: { workflows: Workflow[] }) {
  const id = window.location.pathname.split("/").at(-1);
  const workflow = workflows.find((item) => item.id === id) ?? workflows[0];
  return <div className="grid gap-5"><SectionTitle icon={GitBranch} title={workflow.name} body={workflow.description} /><Surface className="bg-secondary"><div className="grid gap-4 lg:grid-cols-4"><WorkflowNode title="Trigger" body={workflow.trigger.label} icon={Webhook} status={workflow.trigger.preview} /><WorkflowNode title="Conditions" body={`${workflow.conditions.length} rule checks`} icon={SlidersHorizontal} status="policy" /><WorkflowNode title="Decision" body="Advisory output is logged." icon={Activity} status="preview" /><WorkflowNode title="Executor" body={`${workflow.actions.length} configured actions`} icon={ShieldCheck} status="safe" /></div></Surface></div>;
}

function RunsPage({ runs }: { runs: Run[] }) {
  return <div className="grid gap-5"><SectionTitle icon={Clock} title="Runs" body="Inspect every trigger, condition, decision, approval, executor result, and replay event." /><div className="grid gap-4">{runs.map((run) => <Surface key={run.id}><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-mono text-sm text-kite-brown">{run.id}</p><p className="mt-2 text-sm text-muted-foreground">Workflow {run.workflowId}</p></div><div className="flex gap-2"><StatusPill value={run.status} /><StatusPill value={run.risk} /></div></div></Surface>)}</div></div>;
}

function ConnectorsPage() {
  const connectors = [["KiteScan", "Poll transfers, addresses, and transaction data.", Webhook], ["RPC", "Read Kite mainnet state with viem.", KeyRound], ["Signed webhook", "Accept service events with env-only secrets.", Activity], ["LLM advisory", "Classify risk without auto-executing actions.", SlidersHorizontal]] as const;
  return <div className="grid gap-5"><SectionTitle icon={KeyRound} title="Connectors" body="Register KiteScan, RPC, webhook, LLM, wallet, and API connectors with explicit safety labels." /><div className="grid gap-4 md:grid-cols-2">{connectors.map(([name, body, Icon]) => <Surface key={name}><Icon className="text-kite-olive" /><h2 className="mt-4 text-2xl font-bold text-kite-brown">{name}</h2><p className="mt-2 text-sm text-muted-foreground">{body}</p></Surface>)}</div></div>;
}

function ApprovalsPage({ approvals, onResolve }: { approvals: Approval[]; onResolve: (id: string, status: string) => void }) {
  return <div className="grid gap-5"><SectionTitle icon={ShieldCheck} title="Approvals" body="Review risky or fund-moving actions before they can proceed." />{approvals.length === 0 ? <Surface><p className="font-bold text-kite-brown">No approvals waiting</p><p className="mt-2 text-sm text-muted-foreground">Risky workflow actions will appear here before execution.</p></Surface> : <div className="grid gap-4">{approvals.map((approval) => <Surface key={approval.id}><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-mono text-sm text-kite-brown">{approval.id}</p><p className="mt-2 text-sm text-muted-foreground">{approval.reason}</p></div><div className="flex gap-2"><button type="button" onClick={() => onResolve(approval.id, "approved")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><CheckCircle2 size={16} /> Approve</button><button type="button" onClick={() => onResolve(approval.id, "denied")} className="inline-flex items-center gap-2 rounded-lg bg-kite-rust px-4 py-2 text-sm font-bold text-white"><AlertTriangle size={16} /> Deny</button></div></div></Surface>)}</div>}</div>;
}

function SettingsPage() {
  return <div className="grid gap-5"><SectionTitle icon={Wallet} title="Settings" body="Configure Kite network, webhook secrets, policy thresholds, and approval defaults." /><div className="grid gap-4 md:grid-cols-2"><Surface><h2 className="text-xl font-bold text-kite-brown">Network</h2><p className="mt-2 text-sm text-muted-foreground">Mainnet RPC https://rpc.gokite.ai/ and chain ID 2366 are configured.</p></Surface><Surface><h2 className="text-xl font-bold text-kite-brown">Execution mode</h2><p className="mt-2 text-sm text-muted-foreground">Current build uses preview-safe execution and audit logs.</p></Surface></div></div>;
}

function LiveNetworkStrip({ stats }: { stats: ChainStats | null }) {
  if (!stats) return null;
  const live = stats.live && typeof stats.blockNumber === "number";
  return (
    <div className="w-full border-b border-kite-cream/10 bg-kite-brown text-kite-cream">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-5 py-1.5 text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5">
          <span className={cx("h-1.5 w-1.5 rounded-full", live ? "bg-emerald-400" : "bg-amber-400")} />
          {live ? "Live" : "Preview"} · Kite Mainnet · chain 2366
        </span>
        {live && <span>block #{stats.blockNumber!.toLocaleString()}</span>}
        {live && stats.gasPrices && <span>gas {stats.gasPrices.average} gwei</span>}
        <span className="ml-auto opacity-70">{live ? "rpc.gokite.ai + kitescan.ai" : "bundled preview data"}</span>
      </div>
    </div>
  );
}

export function App() {
  const [workflows, setWorkflows] = useState(fallbackWorkflows);
  const [runs, setRuns] = useState(fallbackRuns);
  const [approvals, setApprovals] = useState(fallbackApprovals);
  const [chain, setChain] = useState<ChainStats | null>(null);
  const path = window.location.pathname;

  useEffect(() => {
    fetchWorkflows().then((data) => setWorkflows(data.workflows));
    fetchRuns().then((data) => setRuns(data.runs));
    fetchApprovals().then((data) => setApprovals(data.approvals));
    fetchChainStats().then(setChain);
  }, []);

  const page = useMemo(() => {
    if (path === "/") return <HomePage workflows={workflows} runs={runs} approvals={approvals} />;
    if (path === "/workflows") return <WorkflowsPage workflows={workflows} />;
    if (path === "/workflows/new") return <NewWorkflowPage />;
    if (path.startsWith("/workflows/")) return <WorkflowDetailPage workflows={workflows} />;
    if (path === "/runs") return <RunsPage runs={runs} />;
    if (path === "/connectors") return <ConnectorsPage />;
    if (path === "/approvals") return <ApprovalsPage approvals={approvals} onResolve={(id, status) => setApprovals((current) => current.map((approval) => approval.id === id ? { ...approval, status } : approval).filter((approval) => approval.status === "pending"))} />;
    if (path === "/settings") return <SettingsPage />;
    return <SettingsPage />;
  }, [approvals, path, runs, workflows]);

  return (
    <>
      <LiveNetworkStrip stats={chain} />
      <Shell activePath={path}>{page}</Shell>
    </>
  );
}
