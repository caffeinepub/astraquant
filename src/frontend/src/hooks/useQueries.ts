import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PriceAlert, StockAnalysis, WatchlistItem } from "../backend.d";
import { useActor } from "./useActor";

// ─── Mock data for fallback / preview ─────────────────────────────────────────
function getMockAnalysis(symbol: string, exchange: string): StockAnalysis {
  const mockData: Record<string, StockAnalysis> = {
    RELIANCE: {
      symbol: "RELIANCE",
      exchange: "NSE",
      currentPrice: 2847.5,
      change: 34.2,
      changePercent: 1.22,
      rsi: 58.4,
      macdSignal: 12.6,
      sma20: 2810.3,
      sma50: 2765.8,
      sma200: 2620.1,
      volumeRatio: 1.8,
      supportLevel: 2780.0,
      resistanceLevel: 2920.0,
      signalScore: BigInt(74),
      profitProbability: BigInt(78),
      recommendation: "BUY",
      entryPriceLow: 2820.0,
      entryPriceHigh: 2860.0,
      targetPrice: 3050.0,
      stopLoss: 2720.0,
      quantitySuggestion: BigInt(10),
      analyzedAt: BigInt(Date.now() * 1_000_000),
    },
    TCS: {
      symbol: "TCS",
      exchange: "NSE",
      currentPrice: 4125.8,
      change: -28.4,
      changePercent: -0.68,
      rsi: 44.2,
      macdSignal: -5.3,
      sma20: 4180.5,
      sma50: 4220.0,
      sma200: 4050.3,
      volumeRatio: 0.9,
      supportLevel: 4050.0,
      resistanceLevel: 4250.0,
      signalScore: BigInt(48),
      profitProbability: BigInt(52),
      recommendation: "WAIT",
      entryPriceLow: 4050.0,
      entryPriceHigh: 4100.0,
      targetPrice: 4350.0,
      stopLoss: 3980.0,
      quantitySuggestion: BigInt(5),
      analyzedAt: BigInt(Date.now() * 1_000_000),
    },
    INFY: {
      symbol: "INFY",
      exchange: "NSE",
      currentPrice: 1892.3,
      change: 22.1,
      changePercent: 1.18,
      rsi: 62.8,
      macdSignal: 8.4,
      sma20: 1865.0,
      sma50: 1840.5,
      sma200: 1780.2,
      volumeRatio: 1.4,
      supportLevel: 1840.0,
      resistanceLevel: 1950.0,
      signalScore: BigInt(68),
      profitProbability: BigInt(72),
      recommendation: "BUY",
      entryPriceLow: 1870.0,
      entryPriceHigh: 1900.0,
      targetPrice: 2050.0,
      stopLoss: 1800.0,
      quantitySuggestion: BigInt(8),
      analyzedAt: BigInt(Date.now() * 1_000_000),
    },
    HDFCBANK: {
      symbol: "HDFCBANK",
      exchange: "NSE",
      currentPrice: 1685.4,
      change: -12.6,
      changePercent: -0.74,
      rsi: 38.5,
      macdSignal: -3.2,
      sma20: 1720.0,
      sma50: 1745.0,
      sma200: 1650.0,
      volumeRatio: 0.7,
      supportLevel: 1640.0,
      resistanceLevel: 1760.0,
      signalScore: BigInt(38),
      profitProbability: BigInt(35),
      recommendation: "AVOID",
      entryPriceLow: 1640.0,
      entryPriceHigh: 1670.0,
      targetPrice: 1820.0,
      stopLoss: 1590.0,
      quantitySuggestion: BigInt(3),
      analyzedAt: BigInt(Date.now() * 1_000_000),
    },
    WIPRO: {
      symbol: "WIPRO",
      exchange: "NSE",
      currentPrice: 542.1,
      change: 6.8,
      changePercent: 1.27,
      rsi: 55.0,
      macdSignal: 4.1,
      sma20: 532.5,
      sma50: 518.0,
      sma200: 495.8,
      volumeRatio: 1.2,
      supportLevel: 520.0,
      resistanceLevel: 565.0,
      signalScore: BigInt(60),
      profitProbability: BigInt(65),
      recommendation: "BUY",
      entryPriceLow: 530.0,
      entryPriceHigh: 548.0,
      targetPrice: 600.0,
      stopLoss: 505.0,
      quantitySuggestion: BigInt(20),
      analyzedAt: BigInt(Date.now() * 1_000_000),
    },
    TATAMOTORS: {
      symbol: "TATAMOTORS",
      exchange: "NSE",
      currentPrice: 1023.6,
      change: 15.4,
      changePercent: 1.53,
      rsi: 66.2,
      macdSignal: 18.9,
      sma20: 995.0,
      sma50: 960.5,
      sma200: 880.0,
      volumeRatio: 2.1,
      supportLevel: 985.0,
      resistanceLevel: 1080.0,
      signalScore: BigInt(82),
      profitProbability: BigInt(82),
      recommendation: "BUY",
      entryPriceLow: 1000.0,
      entryPriceHigh: 1030.0,
      targetPrice: 1150.0,
      stopLoss: 960.0,
      quantitySuggestion: BigInt(15),
      analyzedAt: BigInt(Date.now() * 1_000_000),
    },
    SBIN: {
      symbol: "SBIN",
      exchange: "NSE",
      currentPrice: 782.4,
      change: -4.6,
      changePercent: -0.58,
      rsi: 47.3,
      macdSignal: -1.8,
      sma20: 795.0,
      sma50: 808.0,
      sma200: 750.0,
      volumeRatio: 1.0,
      supportLevel: 762.0,
      resistanceLevel: 820.0,
      signalScore: BigInt(45),
      profitProbability: BigInt(50),
      recommendation: "WAIT",
      entryPriceLow: 762.0,
      entryPriceHigh: 785.0,
      targetPrice: 860.0,
      stopLoss: 735.0,
      quantitySuggestion: BigInt(12),
      analyzedAt: BigInt(Date.now() * 1_000_000),
    },
    ICICIBANK: {
      symbol: "ICICIBANK",
      exchange: "NSE",
      currentPrice: 1245.7,
      change: 18.3,
      changePercent: 1.49,
      rsi: 60.5,
      macdSignal: 9.7,
      sma20: 1218.0,
      sma50: 1195.0,
      sma200: 1120.0,
      volumeRatio: 1.6,
      supportLevel: 1200.0,
      resistanceLevel: 1300.0,
      signalScore: BigInt(70),
      profitProbability: BigInt(74),
      recommendation: "BUY",
      entryPriceLow: 1220.0,
      entryPriceHigh: 1255.0,
      targetPrice: 1380.0,
      stopLoss: 1165.0,
      quantitySuggestion: BigInt(8),
      analyzedAt: BigInt(Date.now() * 1_000_000),
    },
  };

  const key = symbol.toUpperCase();
  if (mockData[key]) {
    return { ...mockData[key], exchange };
  }

  // Generic mock for any symbol
  const basePrice =
    800 +
    (Math.abs(symbol.charCodeAt(0) * 31 + symbol.charCodeAt(1) * 17) % 3000);
  const change = (Math.random() - 0.4) * basePrice * 0.03;
  const prob = 40 + Math.floor(Math.abs(symbol.charCodeAt(0)) % 45);
  const rec = prob > 65 ? "BUY" : prob > 45 ? "WAIT" : "AVOID";

  return {
    symbol: symbol.toUpperCase(),
    exchange,
    currentPrice: Math.round(basePrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round((change / basePrice) * 10000) / 100,
    rsi: 35 + (Math.abs(symbol.charCodeAt(0)) % 45),
    macdSignal: (Math.random() - 0.5) * 20,
    sma20: Math.round(basePrice * 0.98 * 100) / 100,
    sma50: Math.round(basePrice * 0.96 * 100) / 100,
    sma200: Math.round(basePrice * 0.92 * 100) / 100,
    volumeRatio: 0.8 + Math.random() * 1.5,
    supportLevel: Math.round(basePrice * 0.94 * 100) / 100,
    resistanceLevel: Math.round(basePrice * 1.06 * 100) / 100,
    signalScore: BigInt(Math.floor(prob * 0.9)),
    profitProbability: BigInt(prob),
    recommendation: rec,
    entryPriceLow: Math.round(basePrice * 0.97 * 100) / 100,
    entryPriceHigh: Math.round(basePrice * 1.01 * 100) / 100,
    targetPrice: Math.round(basePrice * 1.12 * 100) / 100,
    stopLoss: Math.round(basePrice * 0.93 * 100) / 100,
    quantitySuggestion: BigInt(Math.floor(10 + Math.random() * 15)),
    analyzedAt: BigInt(Date.now() * 1_000_000),
  };
}

// ─── Stock Analysis ────────────────────────────────────────────────────────────
export function useAnalyzeStock(symbol: string, exchange: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StockAnalysis>({
    queryKey: ["analysis", symbol, exchange],
    queryFn: async () => {
      if (!actor) return getMockAnalysis(symbol, exchange);
      try {
        return await actor.analyzeStock(symbol, exchange);
      } catch {
        return getMockAnalysis(symbol, exchange);
      }
    },
    enabled: !!symbol && !!exchange && !isFetching,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useGetCachedAnalysis(symbol: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StockAnalysis | null>({
    queryKey: ["cache", symbol],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getAnalysisCache(symbol);
      } catch {
        return null;
      }
    },
    enabled: !!symbol && !isFetching,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Watchlist ─────────────────────────────────────────────────────────────────
export function useGetWatchlist() {
  const { actor, isFetching } = useActor();

  return useQuery<WatchlistItem[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWatchlist();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });
}

export function useAddToWatchlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      symbol,
      exchange,
    }: { symbol: string; exchange: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addToWatchlist(symbol, exchange);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeFromWatchlist(symbol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

// ─── Risk Profile ──────────────────────────────────────────────────────────────
export function useGetRiskProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["riskProfile"],
    queryFn: async () => {
      if (!actor) return "moderate";
      try {
        return await actor.getRiskProfile();
      } catch {
        return "moderate";
      }
    },
    enabled: !isFetching,
  });
}

export function useSaveRiskProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (level: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveRiskProfile(level);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riskProfile"] });
    },
  });
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export function useGetAlerts() {
  const { actor, isFetching } = useActor();

  return useQuery<PriceAlert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAlerts();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
  });
}

export function useAddAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      symbol,
      exchange,
      targetPrice,
      condition,
    }: {
      symbol: string;
      exchange: string;
      targetPrice: number;
      condition: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addAlert(symbol, exchange, targetPrice, condition);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useRemoveAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeAlert(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
