# Fotion

Fotion is a local-first ActivityWatch desktop dashboard. ActivityWatch keeps collecting local activity data, and Fotion turns that data into a daily dashboard, a day timeline, a weekly view, and connection settings.

## Current Scope

- Tier 1 daily dashboard: total active time, app split, 24-hour heatmap, and top window titles.
- Tier 1 timeline view: app-colored day blocks with AFK gaps left empty.
- Tier 1 weekly view: 7-day stacked app bars, weekly total, and daily average.
- Tier 1 settings: ActivityWatch server URL, connection state, discovered buckets, and day boundary.

## Local Setup

1. Install and start ActivityWatch from `https://activitywatch.net/`.
2. Confirm ActivityWatch is collecting data at `http://localhost:5600`.
3. Install Fotion dependencies with `pnpm install`.
4. Start the local web UI with `pnpm dev`.
5. Open the Vite URL and check the Settings tab for a green ActivityWatch connection.

## Desktop Shell

The Tauri 2 shell is included for the desktop app and for proxying ActivityWatch requests without browser CORS issues.

```bash
pnpm tauri dev
```

Tauri requires Rust and the Linux/macOS/Windows system dependencies listed in the Tauri documentation. The web UI still works with `pnpm dev`; during Vite development, `/aw-api` proxies the default local ActivityWatch server.

## Data Model

- Fotion reads ActivityWatch only through the REST/query API.
- The original source of truth remains ActivityWatch's local database.
- Tier 1 does not create a Fotion database, category layer, AI layer, notifications, or menu bar widget.

## Validation

- Compare the daily total and app totals against the ActivityWatch web UI for the same day.
- Leave the dashboard open for one minute and confirm the current app's time increases.
- The accepted Tier 1 tolerance is less than 1% difference from ActivityWatch totals, allowing heartbeat timing drift.
