import kiteMark from "../../assets/brand/kite-logo-mark-black.png";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4">
        <img className="h-10 w-10 object-contain" src={kiteMark} alt="Kite logo mark" />
        <div>
          <div className="kite-brand-word text-lg font-bold text-kite-brown">KiteAutomation Studio</div>
          <div className="text-xs font-bold uppercase text-muted-foreground">AUTOMATION</div>
        </div>
      </div>
    </header>
  );
}
