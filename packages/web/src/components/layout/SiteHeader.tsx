export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-kite-sand bg-kite-brown text-sm font-bold text-kite-cream">KA</div>
        <div>
          <div className="text-base font-bold text-kite-brown">KiteAutomation Studio</div>
          <div className="font-mono text-xs font-semibold text-muted-foreground">AUTOMATION</div>
        </div>
      </div>
    </header>
  );
}

