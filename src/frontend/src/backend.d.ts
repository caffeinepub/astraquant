import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface StockAnalysis {
    rsi: number;
    currentPrice: number;
    macdSignal: number;
    entryPriceLow: number;
    signalScore: bigint;
    entryPriceHigh: number;
    targetPrice: number;
    quantitySuggestion: bigint;
    resistanceLevel: number;
    volumeRatio: number;
    profitProbability: bigint;
    sma20: number;
    sma50: number;
    supportLevel: number;
    analyzedAt: bigint;
    stopLoss: number;
    change: number;
    recommendation: string;
    exchange: string;
    changePercent: number;
    symbol: string;
    sma200: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PriceAlert {
    id: bigint;
    createdAt: bigint;
    targetPrice: number;
    isTriggered: boolean;
    exchange: string;
    symbol: string;
    condition: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface WatchlistItem {
    addedAt: bigint;
    exchange: string;
    symbol: string;
}
export interface UserProfile {
    riskLevel: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAlert(symbol: string, exchange: string, targetPrice: number, condition: string): Promise<bigint>;
    addToWatchlist(symbol: string, exchange: string): Promise<void>;
    analyzeStock(symbol: string, exchange: string): Promise<StockAnalysis>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkAlerts(): Promise<Array<PriceAlert>>;
    getAlerts(): Promise<Array<PriceAlert>>;
    getAnalysisCache(symbol: string): Promise<StockAnalysis | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRiskProfile(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWatchlist(): Promise<Array<WatchlistItem>>;
    isCallerAdmin(): Promise<boolean>;
    removeAlert(id: bigint): Promise<void>;
    removeFromWatchlist(symbol: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveRiskProfile(level: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
