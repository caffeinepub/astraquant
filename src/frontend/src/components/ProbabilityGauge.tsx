import { useMemo } from "react";

interface ProbabilityGaugeProps {
  probability: number;
  size?: number;
  recommendation: string;
}

export function ProbabilityGauge({
  probability,
  size = 160,
  recommendation,
}: ProbabilityGaugeProps) {
  const { strokeColor, dashOffset, circumference } = useMemo(() => {
    const radius = (size / 2) * 0.75;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (probability / 100) * circ;
    let color = "oklch(0.78 0.16 75)"; // wait/amber
    if (recommendation === "BUY") color = "oklch(0.72 0.18 155)";
    if (recommendation === "AVOID") color = "oklch(0.63 0.22 25)";
    return { strokeColor: color, dashOffset: offset, circumference: circ };
  }, [probability, recommendation, size]);

  const center = size / 2;
  const radius = (size / 2) * 0.75;

  return (
    <div
      className="relative flex items-center justify-center"
      data-ocid="analysis.chart_point"
      style={{ width: size, height: size }}
    >
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative gauge */}
      <svg
        width={size}
        height={size}
        className="absolute top-0 left-0 -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="oklch(0.28 0.025 240)"
          strokeWidth="10"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center z-10">
        <span
          className="font-mono font-bold text-foreground"
          style={{ fontSize: size * 0.185 }}
        >
          {probability}%
        </span>
        <span
          className="text-muted-foreground font-medium text-center leading-tight"
          style={{ fontSize: size * 0.075 }}
        >
          Profit
          <br />
          Probability
        </span>
      </div>
    </div>
  );
}
