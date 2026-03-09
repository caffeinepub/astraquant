import { getRSIStatus } from "@/utils/format";

interface RSIGaugeProps {
  rsi: number;
}

export function RSIGauge({ rsi }: RSIGaugeProps) {
  const { label, colorClass, description } = getRSIStatus(rsi);
  const clampedRSI = Math.max(0, Math.min(100, rsi));
  const position = (clampedRSI / 100) * 100;

  // Color zones
  const getBarBg = () => {
    if (rsi < 30) return "bg-buy";
    if (rsi > 70) return "bg-avoid";
    return "bg-wait";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          RSI ({rsi.toFixed(1)})
        </span>
        <span className={`text-xs font-semibold ${colorClass}`}>{label}</span>
      </div>
      <div className="relative h-2.5 rounded-full overflow-hidden bg-secondary">
        {/* Color zones */}
        <div className="absolute inset-y-0 left-0 w-[30%] bg-buy/30 rounded-l-full" />
        <div className="absolute inset-y-0 left-[30%] w-[40%] bg-wait/30" />
        <div className="absolute inset-y-0 right-0 w-[30%] bg-avoid/30 rounded-r-full" />
        {/* Progress */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${getBarBg()}/80`}
          style={{ width: `${position}%` }}
        />
        {/* Needle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground rounded-full"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>0 Oversold</span>
        <span>50 Neutral</span>
        <span>Overbought 100</span>
      </div>
      <p className="text-[11px] text-muted-foreground/70">{description}</p>
    </div>
  );
}
