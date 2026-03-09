import Array "mo:core/Array";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module WatchlistItem {
    public func compareBySymbol(a : WatchlistItem, b : WatchlistItem) : Order.Order {
      Text.compare(a.symbol, b.symbol);
    };
  };

  module PriceAlert {
    public func compareById(a : PriceAlert, b : PriceAlert) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type UserProfile = {
    riskLevel : Text; // conservative, moderate, aggressive
  };

  public type WatchlistItem = {
    symbol : Text;
    exchange : Text; // NSE or BSE
    addedAt : Int;
  };

  public type StockAnalysis = {
    symbol : Text;
    exchange : Text;
    currentPrice : Float;
    change : Float;
    changePercent : Float;
    rsi : Float;
    macdSignal : Float;
    sma20 : Float;
    sma50 : Float;
    sma200 : Float;
    volumeRatio : Float;
    supportLevel : Float;
    resistanceLevel : Float;
    signalScore : Nat; // 0-100
    profitProbability : Nat; // percentage 0-100
    recommendation : Text; // BUY, WAIT, AVOID
    entryPriceLow : Float;
    entryPriceHigh : Float;
    targetPrice : Float;
    stopLoss : Float;
    quantitySuggestion : Nat;
    analyzedAt : Int;
  };

  public type PriceAlert = {
    id : Nat;
    symbol : Text;
    exchange : Text;
    targetPrice : Float;
    condition : Text; // above or below
    isTriggered : Bool;
    createdAt : Int;
  };

  public type AnalysisCache = {
    analysis : StockAnalysis;
    cachedAt : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let watchlist = Map.empty<Principal, Map.Map<Text, WatchlistItem>>();
  let priceAlerts = Map.empty<Principal, Map.Map<Nat, PriceAlert>>();
  let analysisCache = Map.empty<Text, AnalysisCache>();

  var nextAlertId = 1 : Nat;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Legacy risk profile functions (for backward compatibility)
  public shared ({ caller }) func saveRiskProfile(level : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile : UserProfile = { riskLevel = level };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getRiskProfile() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.riskLevel };
      case (null) { Runtime.trap("Risk profile not set") };
    };
  };

  public shared ({ caller }) func addToWatchlist(symbol : Text, exchange : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify watchlist");
    };
    let item : WatchlistItem = {
      symbol;
      exchange;
      addedAt = Time.now();
    };

    let userWatchlist = switch (watchlist.get(caller)) {
      case (null) {
        let newWatchlist = Map.empty<Text, WatchlistItem>();
        watchlist.add(caller, newWatchlist);
        newWatchlist;
      };
      case (?existing) { existing };
    };

    userWatchlist.add(symbol, item);
  };

  public shared ({ caller }) func removeFromWatchlist(symbol : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify watchlist");
    };
    switch (watchlist.get(caller)) {
      case (?userWatchlist) {
        if (userWatchlist.containsKey(symbol)) {
          userWatchlist.remove(symbol);
        } else {
          Runtime.trap("Symbol not found in watchlist");
        };
      };
      case (null) { Runtime.trap("Watchlist not found") };
    };
  };

  public query ({ caller }) func getWatchlist() : async [WatchlistItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access watchlist");
    };
    switch (watchlist.get(caller)) {
      case (?userWatchlist) {
        userWatchlist.values().toArray().sort(WatchlistItem.compareBySymbol);
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func analyzeStock(symbol : Text, exchange : Text) : async StockAnalysis {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can analyze stocks");
    };

    let cacheKey = symbol # "_" # exchange;
    let now = Time.now();
    switch (analysisCache.get(cacheKey)) {
      case (?cache) {
        if (now - cache.cachedAt < 900_000_000_000) {
          return cache.analysis;
        };
      };
      case (null) {};
    };

    let financeURL = "https://query1.finance.yahoo.com/v8/finance/chart/" # symbol # ".NS";
    let _ = await OutCall.httpGetRequest(financeURL, [], transform);
    let analysis : StockAnalysis = {
      symbol;
      exchange;
      currentPrice = 0;
      change = 0;
      changePercent = 0;
      rsi = 0;
      macdSignal = 0;
      sma20 = 0;
      sma50 = 0;
      sma200 = 0;
      volumeRatio = 0;
      supportLevel = 0;
      resistanceLevel = 0;
      signalScore = 0;
      profitProbability = 0;
      recommendation = "WAIT";
      entryPriceLow = 0;
      entryPriceHigh = 0;
      targetPrice = 0;
      stopLoss = 0;
      quantitySuggestion = 0;
      analyzedAt = now;
    };

    let cacheEntry = {
      analysis;
      cachedAt = now;
    };
    analysisCache.add(cacheKey, cacheEntry);

    analysis;
  };

  public query ({ caller }) func getAnalysisCache(symbol : Text) : async ?StockAnalysis {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access analysis cache");
    };
    switch (analysisCache.get(symbol)) {
      case (?cache) {
        if (Time.now() - cache.cachedAt < 900_000_000_000) {
          ?cache.analysis;
        } else {
          analysisCache.remove(symbol);
          null;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func addAlert(symbol : Text, exchange : Text, targetPrice : Float, condition : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage alerts");
    };

    let alertId = nextAlertId;
    let alert : PriceAlert = {
      id = alertId;
      symbol;
      exchange;
      targetPrice;
      condition;
      isTriggered = false;
      createdAt = Time.now();
    };

    let userAlerts = switch (priceAlerts.get(caller)) {
      case (null) {
        let newAlerts = Map.empty<Nat, PriceAlert>();
        priceAlerts.add(caller, newAlerts);
        newAlerts;
      };
      case (?existing) { existing };
    };

    userAlerts.add(alertId, alert);
    nextAlertId += 1;
    alertId;
  };

  public shared ({ caller }) func removeAlert(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage alerts");
    };
    switch (priceAlerts.get(caller)) {
      case (?userAlerts) {
        if (userAlerts.containsKey(id)) {
          userAlerts.remove(id);
        } else {
          Runtime.trap("Alert not found");
        };
      };
      case (null) { Runtime.trap("Alerts not found") };
    };
  };

  public query ({ caller }) func getAlerts() : async [PriceAlert] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alerts");
    };
    switch (priceAlerts.get(caller)) {
      case (?userAlerts) {
        userAlerts.values().toArray().sort(PriceAlert.compareById);
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func checkAlerts() : async [PriceAlert] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alerts");
    };
    switch (priceAlerts.get(caller)) {
      case (?userAlerts) {
        let triggeredAlerts = userAlerts.values().filter(
          func(alert) { alert.isTriggered }
        );
        triggeredAlerts.toArray().sort(PriceAlert.compareById);
      };
      case (null) { [] };
    };
  };
};
