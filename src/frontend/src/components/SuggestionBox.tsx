import type { StockAnalysis } from "@/backend.d.ts";
import { formatINR } from "@/utils/format";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

interface SuggestionBoxProps {
  analysis: StockAnalysis;
  qty: number;
}

type ActionLabel = "BUY" | "SELL" | "WAIT" | "AVOID";

function deriveActionLabel(rec: string): ActionLabel {
  const upper = rec.toUpperCase();
  if (upper === "BUY") return "BUY";
  if (upper === "SELL") return "SELL";
  if (upper === "AVOID") return "AVOID";
  return "WAIT";
}

function buildSummary(
  action: ActionLabel,
  analysis: StockAnalysis,
  qty: number,
): string {
  const prob = Number(analysis.profitProbability);
  const entryLow = formatINR(analysis.entryPriceLow);
  const entryHigh = formatINR(analysis.entryPriceHigh);
  const target = formatINR(analysis.targetPrice);
  const stopLoss = formatINR(analysis.stopLoss);

  switch (action) {
    case "BUY":
      return `There is a ${prob}% probability this stock may increase in value. Consider buying ~${qty} share${qty !== 1 ? "s" : ""} between ${entryLow}–${entryHigh} with a target of ${target} and a stop loss at ${stopLoss}.`;
    case "SELL":
      return `Signal analysis indicates a ${prob}% profit probability with bearish momentum building. It may be prudent to reduce or exit your position around ${formatINR(analysis.currentPrice)}, protecting gains before the stop loss at ${stopLoss}.`;
    case "AVOID":
      return `Signal strength is weak with only ${prob}% profit probability. It is advisable to avoid entering this position until indicators improve — wait for the price to stabilize above ${entryLow} before reconsidering.`;
    default:
      return `Mixed signals currently show a ${prob}% profit probability — not strongly bullish or bearish. Monitor the stock near the entry zone of ${entryLow}–${entryHigh} and wait for a clearer directional signal before committing capital.`;
  }
}

const ACTION_STYLES: Record<
  ActionLabel,
  {
    chip: string;
    border: string;
    glow: string;
    bg: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  BUY: {
    chip: "text-buy bg-buy/10 border-buy/25",
    border: "border-buy/30",
    glow: "shadow-[0_0_32px_oklch(0.72_0.18_155_/_0.18)]",
    bg: "bg-buy/5",
    icon: <ArrowUpCircle className="h-5 w-5 text-buy" />,
    label: "Recommended Action",
  },
  SELL: {
    chip: "text-avoid bg-avoid/10 border-avoid/25",
    border: "border-avoid/30",
    glow: "shadow-[0_0_32px_oklch(0.63_0.22_25_/_0.18)]",
    bg: "bg-avoid/5",
    icon: <ArrowDownCircle className="h-5 w-5 text-avoid" />,
    label: "Recommended Action",
  },
  WAIT: {
    chip: "text-wait bg-wait/10 border-wait/25",
    border: "border-wait/30",
    glow: "shadow-[0_0_32px_oklch(0.78_0.16_75_/_0.18)]",
    bg: "bg-wait/5",
    icon: <Clock className="h-5 w-5 text-wait" />,
    label: "Recommended Action",
  },
  AVOID: {
    chip: "text-avoid bg-avoid/10 border-avoid/25",
    border: "border-avoid/30",
    glow: "shadow-[0_0_32px_oklch(0.63_0.22_25_/_0.18)]",
    bg: "bg-avoid/5",
    icon: <AlertTriangle className="h-5 w-5 text-avoid" />,
    label: "Recommended Action",
  },
};

const TREND_ICON: Record<ActionLabel, React.ReactNode> = {
  BUY: <TrendingUp className="h-4 w-4 text-buy shrink-0 mt-0.5" />,
  SELL: <TrendingDown className="h-4 w-4 text-avoid shrink-0 mt-0.5" />,
  WAIT: <Clock className="h-4 w-4 text-wait shrink-0 mt-0.5" />,
  AVOID: <AlertTriangle className="h-4 w-4 text-avoid shrink-0 mt-0.5" />,
};

export function SuggestionBox({ analysis, qty }: SuggestionBoxProps) {
  const action = deriveActionLabel(analysis.recommendation);
  const styles = ACTION_STYLES[action];
  const summary = buildSummary(action, analysis, qty);
  const prob = Number(analysis.profitProbability);

  return (
    <motion.div
      data-ocid="suggestion.card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.17, duration: 0.45, ease: "easeOut" }}
      className={`card-glass rounded-xl border ${styles.border} ${styles.glow} overflow-hidden mb-4`}
    >
      {/* Header strip */}
      <div
        className={`px-6 py-4 border-b ${styles.border} ${styles.bg} flex items-center justify-between flex-wrap gap-3`}
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-primary opacity-80" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            AI Suggestion Box
          </span>
        </div>

        {/* Action chip */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold tracking-widest ${styles.chip}`}
        >
          {styles.icon}
          <span>{action}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <div className="flex items-start gap-3">
          {TREND_ICON[action]}
          <p className="text-sm text-foreground/85 leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Key stats row */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-secondary/30 border border-border/40 px-3 py-2.5 text-center">
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1">
              Profit Probability
            </p>
            <p
              className={`font-mono text-base font-bold ${prob >= 70 ? "text-buy" : prob >= 50 ? "text-wait" : "text-avoid"}`}
            >
              {prob}%
            </p>
          </div>
          <div className="rounded-lg bg-secondary/30 border border-border/40 px-3 py-2.5 text-center">
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1">
              Suggested Qty
            </p>
            <p className="font-mono text-base font-bold text-primary">
              {qty} shares
            </p>
          </div>
          <div className="rounded-lg bg-buy/10 border border-buy/25 px-3 py-2.5 text-center">
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1">
              Target
            </p>
            <p className="font-mono text-base font-bold text-buy">
              {formatINR(analysis.targetPrice)}
            </p>
          </div>
          <div className="rounded-lg bg-avoid/10 border border-avoid/25 px-3 py-2.5 text-center">
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1">
              Stop Loss
            </p>
            <p className="font-mono text-base font-bold text-avoid">
              {formatINR(analysis.stopLoss)}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-[10px] text-muted-foreground/40 leading-relaxed">
          This suggestion is generated by AI analysis for personal informational
          use only. It is not financial advice. Always do your own research
          before making investment decisions.
        </p>
      </div>
    </motion.div>
  );
}
