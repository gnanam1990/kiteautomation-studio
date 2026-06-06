import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock, GitBranch, KeyRound, Play, RotateCcw, ShieldCheck, SlidersHorizontal, Wallet, Webhook } from "lucide-react";
import kiteMark from "./assets/brand/kite-logo-mark-black.png";
import { fallbackApprovals, fallbackRuns, fallbackWorkflows, fetchApprovals, fetchRuns, fetchWorkflows, type Approval, type Run, type Workflow } from "./lib/api";

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function KiteLogo() {
  return <img className="h-10 w-10 object-contain" src={kiteMark} alt="Kite logo mark" />;
}

function PreviewBadge({ label = "PREVIEW" }: { label?: string }) {
  return <span className="rounded border border-kite-sand bg-secondary px-2 py-1 text-xs font-semibold text-muted-foreground">{label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const isGood = status === "active" || status === "succeeded" || status === "approved" || status === "live";
  const isRisk = status === "waiting-approval" || status === "pending" || status === "high";
  return (
    <span className={classNames("rounded px-2 py-1 text-xs font-semibold", isGood && "bg-olive-50 text-kite-olive", isRisk && "bg-secondary text-kite-rust", !isGood && !isRisk && "bg-secondary text-muted-foreground")}>
      {status}
    </span>
  );
}

function MonoValue({ value }: { value: string }) {
  return <span className="font-mono text-sm text-kite-brown">{value}</span>;
}

function AddressDisplay({ value }: { value: string }) {
  return <MonoValue value={`${value.slice(0, 8)}...${value.slice(-6)}`} />;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-secondary p-6">
      <p className="font-semibold text-kite-brown">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function ErrorState({ body }: { body: string }) {
  return <div className="rounded-lg border border-kite-rust bg-secondary p-4 text-sm text-kite-rust">{body}</div>;
}

function Button({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "secondary" | "danger" }) {
  return (
    <button className={classNames("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold", variant === "primary" && "bg-primary text-primary-foreground", variant === "secondary" && "border border-border bg-secondary text-kite-brown", variant === "danger" && "bg-kite-rust text-white")}>
      {children}
    </button>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={classNames("rounded-lg border border-border bg-card p-5", className)}>{children}</section>;
}

function SiteHeader({ activePath }: { activePath: string }) {
  const links = [
    ["/", "Home"],
    ["/workflows", "Workflows"],
    ["/runs", "Runs"],
    ["/connectors", "Connectors"],
    ["/approvals", "Approvals"],
    ["/settings", "Settings"],
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a className="flex items-center gap-3" href="/">
          <KiteLogo />
          <div>
            <div className="kite-brand-word text-lg font-bold text-kite-brown">KiteAutomation Studio</div>
            <div className="text-xs font-bold uppercase text-muted-foreground">AUTOMATION</div>
          </div>
        </a>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([href, label]) => (
            <a key={href} className={classNames("rounded-lg px-3 py-2 text-sm font-medium", activePath === href ? "bg-secondary text-kite-brown" : "text-muted-foreground hover:bg-secondary")} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>KiteAutomation Studio is community-built and preview-safe.</span>
        <div className="flex flex-wrap gap-4">
          <a href="https://gokite.ai">Kite</a>
          <a href="https://kitescan.ai">KiteScan</a>
          <a href="https://docs.gokite.ai">Docs</a>
          <a href="https://discord.gg/gokite">Discord</a>
        </div>
      </div>
    </footer>
  );
}

function PageHeader({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-2 text-muted-foreground">{icon}<PreviewBadge /></div>
        <h1 className="text-4xl font-bold tracking-tight text-kite-brown">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function AppShell({ children, activePath }: { children: React.ReactNode; activePath: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader activePath={activePath} />
      <main className="mx-auto min-h-[calc(100vh-156px)] max-w-7xl px-5 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}

function HomePage({ workflows, runs, approvals }: { workflows: Workflow[]; runs: Run[]; approvals: Approval[] }) {
  const metrics = [
    ["Active workflows", workflows.filter((item) => item.status === "active").length.toString()],
    ["Runs today", runs.length.toString()],
    ["Approval queue", approvals.filter((item) => item.status === "pending").length.toString()],
    ["Kite chain", "2366"],
  ];
  const modules = [
    ["Trigger Engine", "Detect KiteScan transfers, signed webhooks, and scheduled jobs.", Webhook],
    ["Condition Builder", "Gate events by amount, token, sender, and risk fields.", SlidersHorizontal],
    ["Agent Decision Step", "Advisory model output is logged and never auto-executes risky actions.", Activity],
    ["Action Executor", "Safe actions run; payment actions queue for approval.", ShieldCheck],
    ["Audit Log + Replay", "Every run can be inspected and replayed from its timeline.", RotateCcw],
  ];
  return (
    <>
      <section className="rounded-xl border border-border bg-secondary p-8">
        <PreviewBadge label="PREVIEW HONESTY" />
        <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-kite-brown">Build automations for the agent economy on Kite AI.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Wire on-chain triggers, conditions, advisory agent decisions, approval-gated Kite payments, webhooks, retries, and audit logs without pretending simulated execution is mainnet production.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="/workflows/new"><Button><Play size={16} /> New workflow</Button></a>
          <a href="/runs"><Button variant="secondary"><Activity size={16} /> Inspect runs</Button></a>
        </div>
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {metrics.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-3 font-mono text-2xl font-bold text-kite-brown">{value}</p>
          </Card>
        ))}
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-5">
        {modules.map(([title, body, Icon]) => (
          <Card key={title as string}>
            <Icon className="mb-4 text-kite-olive" size={22} />
            <h3 className="text-xl font-semibold text-kite-brown">{title as string}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{body as string}</p>
          </Card>
        ))}
      </section>
    </>
  );
}

function WorkflowsPage({ workflows }: { workflows: Workflow[] }) {
  return (
    <>
      <PageHeader title="Workflows" description="Create, test, pause, and inspect automations that connect Kite events to safe agent actions." icon={<GitBranch size={22} />} />
      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold text-kite-brown">{workflow.name}</h2><StatusBadge status={workflow.status} /></div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
                <p className="mt-3 text-sm text-muted-foreground">Owner <AddressDisplay value={workflow.owner} /></p>
              </div>
              <a href={`/workflows/${workflow.id}`}><Button variant="secondary">Open</Button></a>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function NewWorkflowPage() {
  return (
    <>
      <PageHeader title="New workflow" description="Draft a trigger, conditions, advisory decision, and explicit approval policy before any action executes." icon={<Play size={22} />} />
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-kite-brown">Workflow name<input className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" defaultValue="Agent service payment monitor" /></label>
          <label className="text-sm font-semibold text-kite-brown">Trigger type<select className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" defaultValue="kitescan-transfer"><option value="kitescan-transfer">KiteScan transfer</option><option value="webhook">Signed webhook</option></select></label>
        </div>
        <textarea className="mt-4 min-h-28 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm" defaultValue="When a KITE payment is above policy threshold, classify risk and queue explicit human approval." />
        <div className="mt-4 flex gap-3"><Button><GitBranch size={16} /> Save draft</Button><Button variant="secondary">Test trigger</Button></div>
      </Card>
    </>
  );
}

function WorkflowDetailPage({ workflows }: { workflows: Workflow[] }) {
  const id = window.location.pathname.split("/").at(-1);
  const workflow = workflows.find((item) => item.id === id) ?? workflows[0];
  return (
    <>
      <PageHeader title={workflow.name} description={workflow.description} icon={<GitBranch size={22} />} />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-2xl font-semibold text-kite-brown">Workflow graph</h2>
          <div className="mt-5 grid gap-3">
            <Step title="Trigger" body={workflow.trigger.label} badge={workflow.trigger.preview} />
            <Step title="Conditions" body={`${workflow.conditions.length} rule checks before execution`} badge="policy" />
            <Step title="Agent decision" body="Advisory only. Output is logged and sent to approval where needed." badge="preview" />
            <Step title="Action executor" body={`${workflow.actions.length} configured actions with approval gates`} badge="safe" />
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold text-kite-brown">Safety policy</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>Payment actions require explicit approval.</li>
            <li>Webhook secrets are env-only in this MVP.</li>
            <li>Polling cursors avoid duplicate execution.</li>
            <li>LLM decisions are advisory unless approved.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}

function Step({ title, body, badge }: { title: string; body: string; badge: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold text-kite-brown">{title}</h3><StatusBadge status={badge} /></div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function RunsPage({ runs }: { runs: Run[] }) {
  return (
    <>
      <PageHeader title="Runs" description="Inspect every trigger, condition, decision, approval, executor result, and replay event." icon={<Clock size={22} />} />
      <div className="grid gap-4">
        {runs.map((run) => (
          <Card key={run.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div><MonoValue value={run.id} /><p className="mt-2 text-sm text-muted-foreground">Workflow <MonoValue value={run.workflowId} /> started {new Date(run.startedAt).toLocaleString()}</p></div>
              <div className="flex gap-2"><StatusBadge status={run.status} /><StatusBadge status={run.risk} /></div>
            </div>
            <div className="mt-4 grid gap-2">
              {run.audit.map((event) => <div key={event.id} className="rounded border border-border bg-secondary px-3 py-2 text-sm"><span className="font-mono text-muted-foreground">{event.actor}</span> — {event.message}</div>)}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function ConnectorsPage() {
  const connectors = [
    ["KiteScan", "Poll transfers, addresses, and transaction data.", "preview"],
    ["RPC", "Read Kite mainnet or testnet state with viem.", "preview"],
    ["Signed webhook", "Accept service events with env-only secrets.", "live"],
    ["LLM advisory", "Classify risk without auto-executing actions.", "preview"],
  ];
  return (
    <>
      <PageHeader title="Connectors" description="Register KiteScan, RPC, webhook, LLM, wallet, and API connectors with explicit safety labels." icon={<KeyRound size={22} />} />
      <div className="grid gap-4 md:grid-cols-2">
        {connectors.map(([name, body, status]) => <Card key={name}><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold text-kite-brown">{name}</h2><StatusBadge status={status} /></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p></Card>)}
      </div>
    </>
  );
}

function ApprovalsPage({ approvals }: { approvals: Approval[] }) {
  return (
    <>
      <PageHeader title="Approvals" description="Review risky or fund-moving actions before they can proceed." icon={<ShieldCheck size={22} />} />
      {approvals.length === 0 ? <EmptyState title="No approvals waiting" body="Risky workflow actions will appear here before execution." /> : (
        <div className="grid gap-4">
          {approvals.map((approval) => <Card key={approval.id}><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><MonoValue value={approval.id} /><p className="mt-2 text-sm text-muted-foreground">{approval.reason}</p></div><div className="flex gap-2"><Button><CheckCircle2 size={16} /> Approve</Button><Button variant="danger"><AlertTriangle size={16} /> Deny</Button></div></div></Card>)}
        </div>
      )}
    </>
  );
}

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Configure Kite network, webhook secrets, policy thresholds, and approval defaults." icon={<Wallet size={22} />} />
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Step title="Network" body="Mainnet RPC https://rpc.gokite.ai/ and chain ID 2366 are configured." badge="live" />
          <Step title="Payment policy" body="Fund-moving actions require approval in all environments." badge="safe" />
          <Step title="Webhook secret" body="Secrets are backend env-only and never exposed to the browser." badge="preview" />
          <Step title="Execution mode" body="Current build uses preview-safe execution and audit logs." badge="preview" />
        </div>
      </Card>
    </>
  );
}

export function App() {
  const [workflows, setWorkflows] = useState(fallbackWorkflows);
  const [runs, setRuns] = useState(fallbackRuns);
  const [approvals, setApprovals] = useState(fallbackApprovals);
  const path = window.location.pathname;

  useEffect(() => {
    fetchWorkflows().then((data) => setWorkflows(data.workflows));
    fetchRuns().then((data) => setRuns(data.runs));
    fetchApprovals().then((data) => setApprovals(data.approvals));
  }, []);

  const page = useMemo(() => {
    if (path === "/") return <HomePage workflows={workflows} runs={runs} approvals={approvals} />;
    if (path === "/workflows") return <WorkflowsPage workflows={workflows} />;
    if (path === "/workflows/new") return <NewWorkflowPage />;
    if (path.startsWith("/workflows/")) return <WorkflowDetailPage workflows={workflows} />;
    if (path === "/runs") return <RunsPage runs={runs} />;
    if (path === "/connectors") return <ConnectorsPage />;
    if (path === "/approvals") return <ApprovalsPage approvals={approvals} />;
    if (path === "/settings") return <SettingsPage />;
    return <ErrorState body="Route not found." />;
  }, [approvals, path, runs, workflows]);

  return <AppShell activePath={path}>{page}</AppShell>;
}

