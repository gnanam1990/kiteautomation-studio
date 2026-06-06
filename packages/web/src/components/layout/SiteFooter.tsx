import kiteMark from "../../assets/brand/kite-logo-mark-black.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
        <img className="h-6 w-6 object-contain" src={kiteMark} alt="Kite logo mark" />
        KiteAutomation Studio is community-built and preview-safe.
      </div>
    </footer>
  );
}
