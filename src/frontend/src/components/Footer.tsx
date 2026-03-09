export function Footer() {
  const year = new Date().getFullYear();
  const utmUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  )}`;

  return (
    <footer className="border-t border-border/40 mt-auto py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {year}. Built with ❤️ using{" "}
          <a
            href={utmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          For personal research &amp; educational use only. Not financial
          advice.
        </p>
      </div>
    </footer>
  );
}
