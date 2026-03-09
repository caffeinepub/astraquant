import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { BarChart2, Bell, BookMarked, TrendingUp } from "lucide-react";

const navLinks = [
  { to: "/", label: "Search", icon: BarChart2, ocid: "nav.search.link" },
  {
    to: "/watchlist",
    label: "Watchlist",
    icon: BookMarked,
    ocid: "nav.watchlist.link",
  },
  { to: "/alerts", label: "Alerts", icon: Bell, ocid: "nav.alerts.link" },
];

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 border border-primary/30 group-hover:bg-primary/30 transition-colors">
              <img
                src="/assets/generated/logo-indiastock.dim_48x48.png"
                alt="AstraQuant"
                className="h-6 w-6 object-cover rounded"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-sm tracking-tight text-foreground">
                Astra<span className="text-primary">Quant</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                NSE · BSE
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon, ocid }) => {
              const isActive =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  data-ocid={ocid}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Market status indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-buy/60 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-buy" />
              </span>
              <span className="hidden md:inline font-mono">LIVE</span>
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-primary hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
