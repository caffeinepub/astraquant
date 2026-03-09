/**
 * Format a number as INR currency with ₹ symbol
 */
export function formatINR(value: number, decimals = 2): string {
  if (Number.isNaN(value)) return "₹—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format large numbers in Indian system (lakhs/crores)
 */
export function formatIndianNumber(value: number): string {
  if (Number.isNaN(value)) return "—";
  if (value >= 1_00_00_000) {
    return `${(value / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (value >= 1_00_000) {
    return `${(value / 1_00_000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * Format a percentage with sign
 */
export function formatPercent(value: number, decimals = 2): string {
  if (Number.isNaN(value)) return "—%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format change with sign and color class
 */
export function getChangeClass(value: number): string {
  if (value > 0) return "text-buy";
  if (value < 0) return "text-avoid";
  return "text-muted-foreground";
}

/**
 * Format a bigint timestamp (nanoseconds) to a readable date
 */
export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms <= 0 || Number.isNaN(ms)) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

/**
 * Format a bigint timestamp to relative time
 */
export function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms <= 0 || Number.isNaN(ms)) return "—";
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * Derive quantity suggestion based on risk level
 */
export function deriveQty(baseQty: bigint, riskLevel: string): number {
  const base = Number(baseQty);
  switch (riskLevel) {
    case "conservative":
      return Math.max(1, Math.floor(base * 0.5));
    case "aggressive":
      return Math.ceil(base * 1.5);
    default:
      return base;
  }
}

/**
 * Get recommendation color classes
 */
export function getRecommendationColors(rec: string): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (rec.toUpperCase()) {
    case "BUY":
      return {
        bg: "bg-buy/15",
        text: "text-buy",
        border: "border-buy/40",
        glow: "glow-buy",
      };
    case "AVOID":
      return {
        bg: "bg-avoid/15",
        text: "text-avoid",
        border: "border-avoid/40",
        glow: "glow-avoid",
      };
    default:
      return {
        bg: "bg-wait/15",
        text: "text-wait",
        border: "border-wait/40",
        glow: "glow-wait",
      };
  }
}

/**
 * Get RSI status
 */
export function getRSIStatus(rsi: number): {
  label: string;
  colorClass: string;
  description: string;
} {
  if (rsi < 30)
    return {
      label: "Oversold",
      colorClass: "text-buy",
      description: "Potentially undervalued — buying opportunity",
    };
  if (rsi > 70)
    return {
      label: "Overbought",
      colorClass: "text-avoid",
      description: "Potentially overvalued — consider caution",
    };
  return {
    label: "Neutral",
    colorClass: "text-wait",
    description: "Normal range — no extreme signal",
  };
}
