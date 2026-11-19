# WORLDVIEW

An experimental macro research terminal that brings a world map, event feeds and market panels into a single React workspace.

[Open the hosted demo](https://worldview-dashboard.vercel.app/)

## What to explore

- **Map** — Explore the geographic context behind event markers and select countries to inspect associated prediction-market examples.
- **Intel wire** — Scan events and headlines next to the map.
- **Market panels** — Read ticker and prediction-market displays alongside the event stream.

The [data hook](src/hooks/useSituationData.ts) attempts public requests to NASA EONET, USGS and CoinGecko, plus NewsAPI when configured. It supplements missing data with simulated examples. The prediction-market panel uses simulated data, and displayed risk levels are prototype heuristics. Treat the hosted site as an interface demo.

## Run locally

```sh
npm ci
npm run dev
```

The stack is React, TypeScript, Vite, MapLibre GL and Zustand. See the [configuration example](.env.example) for optional local settings.
