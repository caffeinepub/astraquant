# AstraQuant

## Current State
- AnalysisPage has a SuggestionBox component showing BUY/SELL/WAIT/AVOID with AI summary.
- HomePage has a hero search bar and below it a row of popular stock chips (RELIANCE, TCS, INFY, etc.) followed by a features grid section.

## Requested Changes (Diff)

### Add
- A "Quick Suggestion" strip/section on the HomePage, placed directly below the popular stock chips row.
- Each popular stock chip should show a small buy/sell/wait badge inline, OR there should be a suggestion panel beneath the chips listing each popular stock with a quick BUY/SELL/WAIT label.
- The suggestion labels should be derived from static/mock signal data (no live API call on homepage load — just representative mock signals per stock that look realistic).

### Modify
- HomePage.tsx: Add a suggestion preview panel below the popular stocks chips section.

### Remove
- Nothing removed.

## Implementation Plan
1. In HomePage.tsx, add static mock signal data for each popular stock (recommendation: BUY/WAIT/AVOID, profitProbability number).
2. Render a compact suggestion panel below the popular chips: a grid/list of cards showing stock symbol, exchange, recommendation badge (color-coded), and profit probability %.
3. Each card is clickable and navigates to the analysis page for that stock.
4. Use motion/react for staggered fade-in.
5. Keep the design minimal and consistent with the existing dark terminal aesthetic.
