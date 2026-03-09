import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Search,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type Recommendation = "BUY" | "WAIT" | "AVOID";

const POPULAR_STOCK_SIGNALS: {
  symbol: string;
  exchange: string;
  recommendation: Recommendation;
  probability: number;
}[] = [
  {
    symbol: "RELIANCE",
    exchange: "NSE",
    recommendation: "BUY",
    probability: 76,
  },
  { symbol: "TCS", exchange: "NSE", recommendation: "WAIT", probability: 54 },
  { symbol: "INFY", exchange: "NSE", recommendation: "BUY", probability: 71 },
  {
    symbol: "HDFCBANK",
    exchange: "NSE",
    recommendation: "WAIT",
    probability: 58,
  },
  {
    symbol: "WIPRO",
    exchange: "NSE",
    recommendation: "AVOID",
    probability: 38,
  },
  {
    symbol: "TATAMOTORS",
    exchange: "NSE",
    recommendation: "BUY",
    probability: 68,
  },
  { symbol: "SBIN", exchange: "NSE", recommendation: "WAIT", probability: 52 },
  {
    symbol: "ICICIBANK",
    exchange: "NSE",
    recommendation: "BUY",
    probability: 73,
  },
];

const REC_STYLES: Record<
  Recommendation,
  { dot: string; badge: string; bar: string; label: string }
> = {
  BUY: {
    dot: "bg-buy",
    badge: "text-buy bg-buy/10 border-buy/25",
    bar: "bg-buy",
    label: "BUY",
  },
  WAIT: {
    dot: "bg-wait",
    badge: "text-wait bg-wait/10 border-wait/25",
    bar: "bg-wait",
    label: "WAIT",
  },
  AVOID: {
    dot: "bg-avoid",
    badge: "text-avoid bg-avoid/10 border-avoid/25",
    bar: "bg-avoid",
    label: "AVOID",
  },
};

const FEATURES = [
  {
    icon: TrendingUp,
    title: "AI Profit Prediction",
    description:
      "Get probability scores for profit potential based on 20+ technical indicators.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    icon: Shield,
    title: "Stop Loss Protection",
    description:
      "AI-recommended stop loss levels to protect your capital from big losses.",
    color: "text-buy",
    bgColor: "bg-buy/10",
    borderColor: "border-buy/20",
  },
  {
    icon: Bell,
    title: "Early Alerts",
    description:
      "Price alerts notify you before key movements happen. Never miss an opportunity.",
    color: "text-wait",
    bgColor: "bg-wait/10",
    borderColor: "border-wait/20",
  },
  {
    icon: Zap,
    title: "Entry & Exit Points",
    description:
      "Precise entry ranges and target prices calculated from support/resistance levels.",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    borderColor: "border-chart-5/20",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState("");
  const [exchange, setExchange] = useState("NSE");

  const handleAnalyze = () => {
    const s = symbol.trim().toUpperCase();
    if (!s) return;
    navigate({
      to: "/analysis/$exchange/$symbol",
      params: { exchange, symbol: s },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  const handleChipClick = (s: string, ex: string) => {
    navigate({
      to: "/analysis/$exchange/$symbol",
      params: { exchange: ex, symbol: s },
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden terminal-grid">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-5/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 flex flex-col items-center text-center max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            NSE &amp; BSE · AI-Powered Analysis
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4"
          >
            Astra
            <span className="text-primary relative">
              Quant
              <span className="absolute -inset-1 bg-primary/10 blur-lg rounded" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
          >
            AI-powered analysis for NSE &amp; BSE stocks. Get probability
            predictions, trade plans, and smart entry/exit signals.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-xl border border-border/80 bg-card/80 backdrop-blur shadow-terminal">
              <Input
                data-ocid="search.search_input"
                placeholder="Enter stock symbol (e.g. RELIANCE, TCS, INFY)..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground/50 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
              />
              <div className="flex gap-2">
                <Select value={exchange} onValueChange={setExchange}>
                  <SelectTrigger
                    data-ocid="search.select"
                    className="w-24 bg-secondary/60 border-border/40 h-11 font-mono text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NSE">NSE</SelectItem>
                    <SelectItem value="BSE">BSE</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  data-ocid="search.primary_button"
                  onClick={handleAnalyze}
                  disabled={!symbol.trim()}
                  className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-primary transition-all"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Popular stocks — enhanced chips with signal dot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            <span className="text-xs text-muted-foreground/60 self-center mr-1">
              Popular:
            </span>
            {POPULAR_STOCK_SIGNALS.map((stock, idx) => {
              const styles = REC_STYLES[stock.recommendation];
              return (
                <button
                  type="button"
                  key={stock.symbol}
                  data-ocid={`search.chip.${idx + 1}`}
                  onClick={() => handleChipClick(stock.symbol, stock.exchange)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 hover:bg-primary/10 hover:border-primary/40 px-3 py-1 text-xs font-mono font-medium text-muted-foreground hover:text-primary transition-all duration-200"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${styles.dot}`}
                  />
                  <span className="font-bold tracking-wide">
                    {stock.symbol}
                  </span>
                  <span className="text-[10px] opacity-50">
                    {stock.exchange}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Quick Market Signals grid */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8 w-full max-w-3xl"
          >
            {/* Section heading */}
            <div className="flex items-center gap-2 mb-4 justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground/80 tracking-wide uppercase font-mono">
                Quick Market Signals
              </span>
              <span className="h-px flex-1 max-w-[4rem] bg-border/40" />
            </div>

            {/* Cards grid */}
            <div
              data-ocid="suggestions.list"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {POPULAR_STOCK_SIGNALS.map((stock, idx) => {
                const styles = REC_STYLES[stock.recommendation];
                return (
                  <motion.button
                    key={stock.symbol}
                    type="button"
                    data-ocid={`suggestions.item.${idx + 1}`}
                    onClick={() =>
                      handleChipClick(stock.symbol, stock.exchange)
                    }
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + idx * 0.07, duration: 0.35 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`card-glass rounded-lg border p-3 text-left flex flex-col gap-2 cursor-pointer transition-all duration-200 hover:border-opacity-60 ${styles.badge.includes("buy") ? "hover:border-buy/50" : styles.badge.includes("wait") ? "hover:border-wait/50" : "hover:border-avoid/50"}`}
                  >
                    {/* Symbol + exchange */}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono font-bold text-sm text-foreground leading-none">
                        {stock.symbol}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground/60">
                        {stock.exchange}
                      </span>
                    </div>

                    {/* Recommendation badge */}
                    <span
                      className={`self-start inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-bold tracking-widest font-mono ${styles.badge}`}
                    >
                      {styles.label}
                    </span>

                    {/* Probability bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground/60 font-mono">
                          Probability
                        </span>
                        <span
                          className={`text-[11px] font-bold font-mono ${styles.badge.split(" ")[0]}`}
                        >
                          {stock.probability}%
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-border/40 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${styles.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${stock.probability}%` }}
                          transition={{
                            delay: 0.55 + idx * 0.07,
                            duration: 0.5,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 py-3 bg-avoid/5 border-y border-avoid/20">
        <div className="container mx-auto flex items-center gap-2 text-xs text-avoid/80">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> For personal research and educational
            use only. Not financial advice. Always consult a SEBI-registered
            advisor before investing.
          </span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-12">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-foreground">
              Your Personal Trading Assistant
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Every signal you need, in one place
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className={`rounded-lg border ${feature.borderColor} ${feature.bgColor} p-5 space-y-3`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-md bg-background/50 border ${feature.borderColor}`}
                >
                  <feature.icon className={`h-4.5 w-4.5 ${feature.color}`} />
                </div>
                <h3 className={`font-semibold text-sm ${feature.color}`}>
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
