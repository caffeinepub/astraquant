import { ProbabilityGauge } from "@/components/ProbabilityGauge";
import { RSIGauge } from "@/components/RSIGauge";
import { SuggestionBox } from "@/components/SuggestionBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAddAlert,
  useAddToWatchlist,
  useAnalyzeStock,
  useGetRiskProfile,
  useSaveRiskProfile,
} from "@/hooks/useQueries";
import {
  deriveQty,
  formatINR,
  formatPercent,
  formatTimestamp,
  getChangeClass,
  getRecommendationColors,
} from "@/utils/format";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  BarChart2,
  Bell,
  BookMarked,
  CheckCircle,
  Minus,
  Newspaper,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type RiskLevel = "conservative" | "moderate" | "aggressive";

function AnalysisSkeleton() {
  return (
    <div data-ocid="analysis.loading_state" className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-10 w-28 ml-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-64 col-span-1" />
        <Skeleton className="h-64 col-span-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

export function AnalysisPage() {
  const { symbol, exchange } = useParams({
    from: "/analysis/$exchange/$symbol",
  });
  const navigate = useNavigate();
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("moderate");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState("above");

  const {
    data: analysis,
    isLoading,
    isError,
    refetch,
  } = useAnalyzeStock(symbol, exchange);
  const { data: savedRisk } = useGetRiskProfile();
  const addToWatchlist = useAddToWatchlist();
  const saveRiskProfile = useSaveRiskProfile();
  const addAlert = useAddAlert();

  const currentRisk: RiskLevel = (savedRisk as RiskLevel) || riskLevel;

  const handleRiskChange = (level: string) => {
    setRiskLevel(level as RiskLevel);
    saveRiskProfile.mutate(level);
  };

  const handleAddToWatchlist = async () => {
    try {
      await addToWatchlist.mutateAsync({ symbol, exchange });
      toast.success(`${symbol} added to watchlist`);
    } catch {
      toast.error("Could not add to watchlist");
    }
  };

  const handleAddAlert = async () => {
    const price = Number.parseFloat(alertPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      await addAlert.mutateAsync({
        symbol,
        exchange,
        targetPrice: price,
        condition: alertCondition,
      });
      toast.success(`Alert set for ${symbol} at ₹${price}`);
      setAlertOpen(false);
      setAlertPrice("");
    } catch {
      toast.error("Could not set alert");
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back
        </Button>
        <AnalysisSkeleton />
      </main>
    );
  }

  if (isError || !analysis) {
    return (
      <main
        className="container mx-auto px-4 py-8"
        data-ocid="analysis.error_state"
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BarChart2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Analysis Failed
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Could not analyze {symbol}. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
      </main>
    );
  }

  const recColors = getRecommendationColors(analysis.recommendation);
  const probNum = Number(analysis.profitProbability);
  const signalNum = Number(analysis.signalScore);
  const qty = deriveQty(analysis.quantitySuggestion, currentRisk);
  const changeIsPositive = analysis.change >= 0;

  const smaData = [
    {
      period: "SMA 20",
      value: analysis.sma20,
      label: analysis.currentPrice >= analysis.sma20 ? "Above" : "Below",
      bullish: analysis.currentPrice >= analysis.sma20,
    },
    {
      period: "SMA 50",
      value: analysis.sma50,
      label: analysis.currentPrice >= analysis.sma50 ? "Above" : "Below",
      bullish: analysis.currentPrice >= analysis.sma50,
    },
    {
      period: "SMA 200",
      value: analysis.sma200,
      label: analysis.currentPrice >= analysis.sma200 ? "Above" : "Below",
      bullish: analysis.currentPrice >= analysis.sma200,
    },
  ];

  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          className="gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to Search</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            data-ocid="analysis.primary_button"
            variant="outline"
            size="sm"
            onClick={handleAddToWatchlist}
            disabled={addToWatchlist.isPending}
            className="gap-1.5 border-border/60 hover:border-primary/40 hover:text-primary"
          >
            <BookMarked className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Watchlist</span>
          </Button>
          <Button
            data-ocid="analysis.open_modal_button"
            variant="outline"
            size="sm"
            onClick={() => setAlertOpen(true)}
            className="gap-1.5 border-border/60 hover:border-wait/40 hover:text-wait"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Set Alert</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-muted-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Stock Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-start gap-4 mb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {analysis.symbol}
            </h1>
            <Badge
              variant="outline"
              className="font-mono text-xs border-primary/30 text-primary bg-primary/10"
            >
              {analysis.exchange}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-foreground">
              {formatINR(analysis.currentPrice)}
            </span>
            <div
              className={`flex items-center gap-1 ${getChangeClass(analysis.change)}`}
            >
              {changeIsPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : analysis.change < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              <span className="font-mono text-sm font-semibold">
                {changeIsPositive ? "+" : ""}
                {formatINR(analysis.change)} (
                {formatPercent(analysis.changePercent)})
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1 font-mono">
            Analyzed: {formatTimestamp(analysis.analyzedAt)}
          </p>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* AI Signal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={`card-glass rounded-xl p-6 border ${recColors.border} ${recColors.glow} flex flex-col items-center text-center`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              AI Signal
            </span>
          </div>

          <ProbabilityGauge
            probability={probNum}
            size={160}
            recommendation={analysis.recommendation}
          />

          <div
            className={`mt-4 px-6 py-2 rounded-full border text-lg font-bold tracking-wider ${recColors.bg} ${recColors.text} ${recColors.border}`}
          >
            {analysis.recommendation}
          </div>

          <div className="mt-4 w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Signal Strength</span>
              <span className="font-mono font-semibold text-foreground">
                {signalNum}/100
              </span>
            </div>
            <Progress value={signalNum} className="h-2" />
          </div>

          <p className="mt-3 text-xs text-muted-foreground/70 leading-relaxed">
            {probNum >= 70
              ? "Strong bullish signals detected across multiple indicators."
              : probNum >= 50
                ? "Mixed signals — exercise caution and watch for confirmation."
                : "Weak or bearish signals — consider waiting or avoiding."}
          </p>
        </motion.div>

        {/* Trade Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="card-glass rounded-xl p-6 border border-border/60 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Trade Plan
              </span>
            </div>
            {/* Risk level tabs */}
            <Tabs value={currentRisk} onValueChange={handleRiskChange}>
              <TabsList className="h-7 bg-secondary/60 p-0.5">
                <TabsTrigger
                  data-ocid="analysis.tab"
                  value="conservative"
                  className="h-6 text-[10px] px-2 data-[state=active]:bg-card"
                >
                  Conservative
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="analysis.tab"
                  value="moderate"
                  className="h-6 text-[10px] px-2 data-[state=active]:bg-card"
                >
                  Moderate
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="analysis.tab"
                  value="aggressive"
                  className="h-6 text-[10px] px-2 data-[state=active]:bg-card"
                >
                  Aggressive
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {/* Entry Range */}
            <div className="rounded-lg bg-secondary/30 border border-border/40 p-3">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1">
                Entry Range
              </p>
              <p className="font-mono text-sm font-bold text-foreground">
                {formatINR(analysis.entryPriceLow)}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                – {formatINR(analysis.entryPriceHigh)}
              </p>
            </div>

            {/* Target Price */}
            <div className="rounded-lg bg-buy/10 border border-buy/25 p-3">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1">
                Target Price
              </p>
              <p className="font-mono text-sm font-bold text-buy">
                {formatINR(analysis.targetPrice)}
              </p>
              <p className="text-[10px] text-buy/60 mt-0.5">
                +
                {formatPercent(
                  ((analysis.targetPrice - analysis.currentPrice) /
                    analysis.currentPrice) *
                    100,
                )}
              </p>
            </div>

            {/* Stop Loss */}
            <div className="rounded-lg bg-avoid/10 border border-avoid/25 p-3">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-1">
                Stop Loss
              </p>
              <p className="font-mono text-sm font-bold text-avoid">
                {formatINR(analysis.stopLoss)}
              </p>
              <p className="text-[10px] text-avoid/60 mt-0.5">
                {formatPercent(
                  ((analysis.stopLoss - analysis.currentPrice) /
                    analysis.currentPrice) *
                    100,
                )}
              </p>
            </div>
          </div>

          {/* Qty Suggestion */}
          <div className="rounded-lg bg-primary/10 border border-primary/25 p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-0.5">
                Suggested Quantity
              </p>
              <p className="font-mono text-2xl font-bold text-primary">
                {qty} shares
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground/60 mb-0.5">
                Est. Investment
              </p>
              <p className="font-mono text-sm font-semibold text-foreground">
                {formatINR(qty * analysis.currentPrice)}
              </p>
            </div>
          </div>

          <Separator className="my-4 bg-border/40" />

          {/* Support & Resistance */}
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-lg bg-secondary/30 border border-border/40 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">
                Support
              </p>
              <p className="font-mono text-sm font-bold text-buy mt-0.5">
                {formatINR(analysis.supportLevel)}
              </p>
            </div>
            <span className="text-muted-foreground/40 text-xs">↔</span>
            <div className="flex-1 rounded-lg bg-secondary/30 border border-border/40 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">
                Resistance
              </p>
              <p className="font-mono text-sm font-bold text-avoid mt-0.5">
                {formatINR(analysis.resistanceLevel)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Suggestion Box */}
      <SuggestionBox analysis={analysis} qty={qty} />

      {/* Technical Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="card-glass rounded-xl p-6 border border-border/60 mb-4"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Technical Indicators
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* RSI */}
            <div className="rounded-lg bg-secondary/20 border border-border/30 p-4">
              <RSIGauge rsi={analysis.rsi} />
            </div>

            {/* MACD */}
            <div className="rounded-lg bg-secondary/20 border border-border/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  MACD Signal
                </span>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${analysis.macdSignal > 0 ? "bg-buy/15 text-buy" : "bg-avoid/15 text-avoid"}`}
                >
                  {analysis.macdSignal > 0 ? "BULLISH" : "BEARISH"}
                </span>
              </div>
              <p className="font-mono text-lg font-bold text-foreground mt-2">
                {analysis.macdSignal > 0 ? "+" : ""}
                {analysis.macdSignal.toFixed(3)}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                {analysis.macdSignal > 0
                  ? "MACD above signal line — upward momentum"
                  : "MACD below signal line — downward momentum"}
              </p>
            </div>

            {/* Volume */}
            <div className="rounded-lg bg-secondary/20 border border-border/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  Volume Ratio
                </span>
                <span
                  className={`text-xs font-mono font-bold ${analysis.volumeRatio >= 1.5 ? "text-primary" : "text-muted-foreground"}`}
                >
                  {analysis.volumeRatio.toFixed(2)}x
                  {analysis.volumeRatio >= 1.5 && (
                    <span className="ml-1 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                      HIGH
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${analysis.volumeRatio >= 1.5 ? "bg-primary" : "bg-muted-foreground/40"}`}
                  style={{
                    width: `${Math.min(100, (analysis.volumeRatio / 3) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-2">
                {analysis.volumeRatio >= 1.5
                  ? "Above-average volume confirms price movement strength."
                  : "Below-average volume — movement may lack conviction."}
              </p>
            </div>
          </div>

          {/* Right Column — Moving Averages */}
          <div>
            <div className="rounded-lg bg-secondary/20 border border-border/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  Moving Averages
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold text-muted-foreground/60 py-2">
                      Period
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground/60 py-2">
                      Value
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground/60 py-2">
                      Signal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smaData.map((row) => (
                    <TableRow
                      key={row.period}
                      className="border-border/20 hover:bg-secondary/20"
                    >
                      <TableCell className="font-mono text-xs py-3 text-muted-foreground">
                        {row.period}
                      </TableCell>
                      <TableCell className="font-mono text-sm py-3 font-semibold text-foreground">
                        {formatINR(row.value)}
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${row.bullish ? "text-buy" : "text-avoid"}`}
                        >
                          {row.bullish ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {row.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* MA Summary */}
              <div className="px-4 py-3 border-t border-border/30 bg-secondary/10">
                <div className="flex items-center gap-2">
                  {smaData.every((r) => r.bullish) ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-buy" />
                      <span className="text-xs text-buy font-medium">
                        Price above all major MAs — strong bullish trend
                      </span>
                    </>
                  ) : smaData.filter((r) => r.bullish).length >= 2 ? (
                    <>
                      <Activity className="h-3.5 w-3.5 text-wait" />
                      <span className="text-xs text-wait font-medium">
                        Mixed MA signals — moderate bullish bias
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3.5 w-3.5 text-avoid" />
                      <span className="text-xs text-avoid font-medium">
                        Price below major MAs — bearish trend
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* News & Sentiment */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="card-glass rounded-xl p-6 border border-border/60"
      >
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            News &amp; Market Sentiment
          </span>
        </div>
        <div className="rounded-lg bg-secondary/20 border border-border/30 p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Market sentiment analysis is updated regularly. For the latest
            updates on{" "}
            <span className="text-foreground font-semibold">
              {analysis.symbol}
            </span>
            , check financial news sources such as{" "}
            <span className="text-primary">Economic Times Markets</span>,{" "}
            <span className="text-primary">Moneycontrol</span>, or{" "}
            <span className="text-primary">NSE India</span>.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3">
            Note: News sentiment is a supplementary indicator. Always combine
            with technical analysis before making trading decisions.
          </p>
        </div>
      </motion.div>

      {/* Alert Dialog */}
      <AnimatePresence>
        <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
          <DialogContent
            data-ocid="analysis.dialog"
            className="bg-card border-border/60 max-w-sm"
          >
            <DialogHeader>
              <DialogTitle className="font-display">
                Set Price Alert
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Get notified when {symbol} reaches your target price.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Target Price (₹)
                </Label>
                <Input
                  data-ocid="analysis.input"
                  type="number"
                  placeholder={`e.g. ${analysis.targetPrice.toFixed(2)}`}
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="font-mono bg-secondary/40 border-border/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Condition
                </Label>
                <Select
                  value={alertCondition}
                  onValueChange={setAlertCondition}
                >
                  <SelectTrigger
                    data-ocid="analysis.select"
                    className="bg-secondary/40 border-border/60"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">
                      Price goes above target
                    </SelectItem>
                    <SelectItem value="below">
                      Price goes below target
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlertOpen(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                data-ocid="analysis.submit_button"
                size="sm"
                onClick={handleAddAlert}
                disabled={addAlert.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                Set Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </main>
  );
}
