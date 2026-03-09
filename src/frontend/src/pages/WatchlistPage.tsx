import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWatchlist, useRemoveFromWatchlist } from "@/hooks/useQueries";
import { formatTimestamp } from "@/utils/format";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  BookMarked,
  Calendar,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

function WatchlistSkeleton() {
  return (
    <div data-ocid="watchlist.loading_state" className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

export function WatchlistPage() {
  const navigate = useNavigate();
  const { data: watchlist, isLoading } = useGetWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const handleRemove = async (symbol: string) => {
    try {
      await removeFromWatchlist.mutateAsync(symbol);
      toast.success(`${symbol} removed from watchlist`);
    } catch {
      toast.error("Could not remove from watchlist");
    }
  };

  const handleAnalyze = (symbol: string, exchange: string) => {
    navigate({
      to: "/analysis/$exchange/$symbol",
      params: { exchange, symbol },
    });
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/25">
            <BookMarked className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Watchlist
            </h1>
            <p className="text-xs text-muted-foreground">
              Track your stocks of interest
            </p>
          </div>
        </div>
        {watchlist && watchlist.length > 0 && (
          <p className="text-xs text-muted-foreground/60 mt-2">
            {watchlist.length} stock{watchlist.length !== 1 ? "s" : ""} being
            tracked
          </p>
        )}
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <WatchlistSkeleton />
      ) : !watchlist || watchlist.length === 0 ? (
        <motion.div
          data-ocid="watchlist.empty_state"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-24 text-center rounded-xl border border-border/40 bg-card/40"
        >
          <BookMarked className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No stocks in watchlist
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Search for a stock and click "Add to Watchlist" to track it here.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="gap-1.5"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Search Stocks
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {watchlist.map((item, idx) => (
              <motion.div
                key={item.symbol}
                data-ocid={`watchlist.item.${idx + 1}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="card-glass rounded-xl p-4 border border-border/60 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                    <TrendingUp className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-foreground">
                        {item.symbol}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-primary/25 text-primary bg-primary/10"
                      >
                        {item.exchange}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground/60">
                      <Calendar className="h-3 w-3" />
                      <span>Added {formatTimestamp(item.addedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    data-ocid={`watchlist.secondary_button.${idx + 1}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyze(item.symbol, item.exchange)}
                    className="gap-1.5 border-primary/25 text-primary hover:bg-primary/15 text-xs"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    Analyze
                  </Button>
                  <Button
                    data-ocid={`watchlist.delete_button.${idx + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item.symbol)}
                    disabled={removeFromWatchlist.isPending}
                    className="h-8 w-8 text-muted-foreground hover:text-avoid hover:bg-avoid/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
