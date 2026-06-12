# Fotion — Product Spec

> Last updated: 2026-06-12. Owner: @junhodo.
> Tier 1 is the active scope. Tiers 2–4 are recorded here so Tier 1 decisions don't paint us into a corner, but they are NOT committed work.

## Product positioning

Open-source Rize.io alternative. Three pillars:

1. **Local-first** — ActivityWatch is the single source of truth for raw activity. No Fotion cloud, no accounts.
2. **BYO-AI** — AI features run through the user's existing Claude / ChatGPT subscription via local CLIs. Fotion never ships or requires its own API key.
3. **Product-grade UI** — the gap Fotion fills over stock ActivityWatch is motivation: a dashboard you *want* to open every morning.

Target user (initial): an individual developer/knowledge worker on macOS who already lives in their menu bar, may already run ActivityWatch, and pays for Claude Pro/Max or ChatGPT.

---

## Tier 1 — Read-only dashboards (ACTIVE)

All Tier 1 features are pure reads from the ActivityWatch REST/query API. No derived database, no writes, no AI.

### T1-1 Daily dashboard

The "open every morning" screen. One day at a time, default today, ← → day navigation.

- **Total active time** — big headline number: sum of window events ∩ `not-afk`.
- **App breakdown** — horizontal bar list (app icon, name, duration, % of day), sorted desc. Powered by the AW query API `merge_events_by_keys(active_events, ['app'])` — verified working (see ARCHITECTURE).
- **Hourly activity heatmap** — 24 columns showing active seconds per hour; identifies "when was I actually working".
- **Top window titles** (per app, expandable) — `merge_events_by_keys(..., ['app', 'title'])`, top 5 per app.

### T1-2 Timeline view

The signature Rize-style view: the day rendered as a horizontal/vertical time axis with colored blocks.

- One lane, blocks = contiguous window events, colored by app (stable hash → palette; later replaced by category colors in Tier 2).
- Hover → tooltip with app, title, start–end, duration.
- AFK periods rendered as gaps/hatched blocks.
- Zoom: full day ↔ working hours. Min block render width: merge sub-10s events visually into their neighbor at low zoom (median raw event is ~2s — see ARCHITECTURE; raw rendering would be noise).

### T1-3 Weekly view

- 7-day stacked bar chart (one bar per day, stacked by top-N apps + "other").
- Day-over-day total active time trend line.
- Week navigation, weekly totals + daily average.

### T1-4 Settings (minimal)

- AW server URL (default `http://localhost:5600`).
- Connection status indicator + "AW not running" empty state with launch instructions.
- Day boundary (default 04:00 local — a 'day' runs 04:00→04:00 so late-night work counts as one day).

### Non-goals for Tier 1

No categories, no sessions, no focus score, no AI, no menu bar widget, no notifications, no browser-tab detail (requires aw-watcher-web; revisit in Tier 2), no Windows/Linux packaging effort (Tauri keeps the door open; macOS is the only tested target).

---

## Tier 2 — Derived layer (PLANNED)

Where Fotion's own database appears (SQLite alongside AW; AW stays read-only).

- **Category rules**: user-defined rules (app/title/URL regex → category), evaluated locally. Categories: Work / Communication / Learning / Entertainment / Other (user-editable).
- **AI-assisted categorization (BYO-AI debut)**: uncategorized app+title pairs batched to the user's own subscription via local CLI (`claude -p` headless mode, or `codex exec`). User reviews suggestions before they become rules. Prompts and responses visible in a log — transparency is the feature.
- **Session detection**: cluster raw events into work sessions (gap threshold + app-switch density).
- **Focus score**: composite of session length, switch rate, entertainment share.

## Tier 3 — Interventions (PLANNED)

- Menu bar widget: today's active time + current app streak.
- **Nudges**: rule-based first — "YouTube continuously > 30 min → notification with a gentle suggestion". AI-personalized phrasing later via BYO-AI.
- Break reminders based on continuous `not-afk` streak length.

## Tier 4 — AI coaching (PLANNED)

- Daily/weekly natural-language summary generated through the user's subscription.
- Q&A over local history ("when do I focus best?").

---

## BYO-AI principles (applies to every tier)

1. AI is **always optional** — every feature must degrade gracefully to rules/manual when no CLI is available.
2. Use the user's **subscription CLIs** (`claude`, `codex`), never bundled API keys. Detect availability by probing the binary.
3. **Show the prompt** — every AI call is logged and inspectable in the UI.
4. Batch + cheap by default: categorization batches at most a few calls/day.
