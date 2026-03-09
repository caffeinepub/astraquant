import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddAlert, useGetAlerts, useRemoveAlert } from "@/hooks/useQueries";
import { formatINR, formatTimestamp } from "@/utils/format";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function AlertsSkeleton() {
  return (
    <div data-ocid="alerts.loading_state" className="space-y-3">
      {[1, 2].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

export function AlertsPage() {
  const [symbol, setSymbol] = useState("");
  const [exchange, setExchange] = useState("NSE");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState("above");

  const { data: alerts, isLoading } = useGetAlerts();
  const addAlert = useAddAlert();
  const removeAlert = useRemoveAlert();

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = symbol.trim().toUpperCase();
    if (!sym) {
      toast.error("Enter a stock symbol");
      return;
    }
    const price = Number.parseFloat(targetPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      await addAlert.mutateAsync({
        symbol: sym,
        exchange,
        targetPrice: price,
        condition,
      });
      toast.success(`Alert set for ${sym} at ₹${price}`);
      setSymbol("");
      setTargetPrice("");
    } catch {
      toast.error("Could not set alert");
    }
  };

  const handleRemoveAlert = async (id: bigint) => {
    try {
      await removeAlert.mutateAsync(id);
      toast.success("Alert removed");
    } catch {
      toast.error("Could not remove alert");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-wait/15 border border-wait/25">
            <Bell className="h-4.5 w-4.5 text-wait" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Price Alerts
            </h1>
            <p className="text-xs text-muted-foreground">
              Get notified before key price movements
            </p>
          </div>
        </div>
      </motion.div>

      {/* Add Alert Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="card-glass rounded-xl p-5 border border-border/60 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Create New Alert
          </span>
        </div>
        <form onSubmit={handleAddAlert}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Symbol</Label>
              <Input
                data-ocid="alerts.symbol_input"
                placeholder="e.g. RELIANCE"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="font-mono bg-secondary/40 border-border/60 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Exchange</Label>
              <Select value={exchange} onValueChange={setExchange}>
                <SelectTrigger
                  data-ocid="alerts.select"
                  className="bg-secondary/40 border-border/60 h-9 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NSE">NSE</SelectItem>
                  <SelectItem value="BSE">BSE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Target Price (₹)
              </Label>
              <Input
                data-ocid="alerts.price_input"
                type="number"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="font-mono bg-secondary/40 border-border/60 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="bg-secondary/40 border-border/60 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Price above target</SelectItem>
                  <SelectItem value="below">Price below target</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            data-ocid="alerts.submit_button"
            type="submit"
            size="sm"
            disabled={addAlert.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          >
            <Bell className="h-3.5 w-3.5" />
            {addAlert.isPending ? "Setting alert..." : "Set Alert"}
          </Button>
        </form>
      </motion.div>

      {/* Alerts List */}
      {isLoading ? (
        <AlertsSkeleton />
      ) : !alerts || alerts.length === 0 ? (
        <motion.div
          data-ocid="alerts.empty_state"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border/40 bg-card/40"
        >
          <Bell className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No alerts set
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create an alert above to get notified when a stock hits your target
            price.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground/60 px-1">
            {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
          </p>
          <AnimatePresence>
            {alerts.map((alert, idx) => (
              <motion.div
                key={Number(alert.id)}
                data-ocid={`alerts.item.${idx + 1}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className={`card-glass rounded-xl p-4 border flex items-center justify-between gap-4 ${
                  alert.isTriggered
                    ? "border-wait/40 bg-wait/5"
                    : "border-border/60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                      alert.isTriggered
                        ? "bg-wait/15 border border-wait/30"
                        : "bg-secondary/40 border border-border/40"
                    }`}
                  >
                    {alert.isTriggered ? (
                      <CheckCircle className="h-4.5 w-4.5 text-wait" />
                    ) : (
                      <TrendingUp className="h-4.5 w-4.5 text-muted-foreground/60" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base text-foreground">
                        {alert.symbol}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-primary/25 text-primary bg-primary/10"
                      >
                        {alert.exchange}
                      </Badge>
                      {alert.isTriggered && (
                        <Badge className="text-[10px] bg-wait/20 text-wait border-wait/40 border">
                          TRIGGERED
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1 text-xs">
                        <AlertTriangle
                          className={`h-3 w-3 ${alert.condition === "above" ? "text-buy" : "text-avoid"}`}
                        />
                        <span className="text-muted-foreground">
                          {alert.condition === "above" ? "Above" : "Below"}{" "}
                          <span
                            className={`font-mono font-semibold ${alert.condition === "above" ? "text-buy" : "text-avoid"}`}
                          >
                            {formatINR(alert.targetPrice)}
                          </span>
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground/50">
                        Set {formatTimestamp(alert.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  data-ocid={`alerts.delete_button.${idx + 1}`}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAlert(alert.id)}
                  disabled={removeAlert.isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-avoid hover:bg-avoid/10 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
