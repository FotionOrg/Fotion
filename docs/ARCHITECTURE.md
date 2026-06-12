# Fotion — Architecture

> Last updated: 2026-06-12. Records decisions made for Tier 1 plus verified ActivityWatch behavior (measured locally on AW v0.13.2, macOS).

## Stack

| Layer | Choice | Why |
|---|---|---|
| App shell | **Tauri 2** | Menu bar tray, native notifications, and local process spawning (`claude`/`codex` CLIs) are all needed by Tiers 2–4; Tauri gives them without Electron's weight. Native `fetch` from the Rust side / Tauri HTTP plugin also avoids browser CORS against the AW server. |
| UI | React + TypeScript + Vite | Standard, fast iteration. |
| Charts | (decide at implementation; candidates: visx, echarts, hand-rolled SVG for timeline) | Timeline view is custom rendering either way. |
| Data engine | **ActivityWatch** (external, user-installed) | Cross-platform watchers, heartbeat dedup, REST + query API. We do not fork or bundle it in Tier 1; Fotion requires a running AW instance. |
| Fotion DB | none in Tier 1; SQLite (Tier 2+) for categories/sessions/scores | AW stays read-only source of truth; derived data is ours. |

## ActivityWatch integration — verified behavior

Everything below was measured against a live AW v0.13.2 install (2026-06-12), not just docs.

### Storage

- Single local SQLite file: `~/Library/Application Support/activitywatch/aw-server/peewee-sqlite.v2.db` (Python server, Peewee ORM).
- Two tables only:
  ```sql
  bucketmodel (key, id, created, name, type, client, hostname, datastr)
  eventmodel  (id, bucket_id, timestamp, duration, datastr)  -- datastr = JSON string
  ```
  Event payloads are schemaless JSON in `datastr`; indexes on `bucket_id` and `timestamp`.
- **Do not read the SQLite file directly** — the server writes to it continuously (lock risk) and the file location/engine differs between the Python and Rust servers. Always go through the REST API.

### Buckets & event shapes (default install)

| Bucket | type | Event `data` | Notes |
|---|---|---|---|
| `aw-watcher-window_<host>` | `currentwindow` | `{app, title}` | Focused window only, ~1s polling. Unicode app names work (`카카오톡`). |
| `aw-watcher-afk_<host>` | `afkstatus` | `{status: "afk"\|"not-afk"}` | Input-based; default 3 min timeout. |
| `aw-watcher-web-*` (optional) | `web.tab.current` | `{url, title, audible, incognito}` | Requires browser extension; NOT installed by default. |

### Critical: the last event is mutable

Heartbeat merging **updates the last row's `duration` in place** rather than appending (observed live: one Slack event grew 19.9s → 49.9s in the same row id). Consequences:

- Any caching/sync layer must treat the trailing edge of data as unsettled. Re-fetch a sliding window (e.g. last 10 minutes) rather than assuming events are append-only.
- Event `id`s are NOT stable progress cursors for incremental sync.

### Measured data rates (10-min sample, active developer use)

- ~10 window events/min during heavy context-switching; **median event duration 2.1s**.
- → A raw timeline render would be visual noise; the timeline view needs visual merging at low zoom (SPEC T1-2).
- Storage: ~16 KB per 10 min of dense activity → tens of MB per *year*. Volume is a non-issue.

### Query API (server-side aggregation)

`POST /api/0/query/` with a body like:

```json
{
  "timeperiods": ["2026-06-12T00:00:00+00:00/2026-06-13T00:00:00+00:00"],
  "query": [
    "window_events = query_bucket(find_bucket('aw-watcher-window_'));",
    "afk_events = query_bucket(find_bucket('aw-watcher-afk_'));",
    "active_events = filter_period_intersect(window_events, filter_keyvals(afk_events, 'status', ['not-afk']));",
    "merged = merge_events_by_keys(active_events, ['app']);",
    "RETURN = sort_by_duration(merged);"
  ]
}
```

Verified working — returns per-app totals with AFK time already excluded. **Tier 1 should lean on this** instead of client-side aggregation:

- Daily app breakdown: query above.
- Top titles: `merge_events_by_keys(active_events, ['app', 'title'])`.
- Timeline: raw `GET /api/0/buckets/<id>/events?start=...&end=...` (timeline needs raw events, not merged).
- Multi-day (weekly): pass 7 entries in `timeperiods`, one per day — the response is an array of per-period results.

### Other API notes

- `GET /api/0/info` → server health check (`hostname`, `version`, `device_id`).
- `GET /api/0/buckets/` → bucket discovery. Bucket ids embed the hostname; **discover, don't hardcode**.
- The AW REST API has no auth; it binds to localhost. Fotion talks to `http://localhost:5600` by default (configurable).
- CORS: the AW server only allows configured origins. Tauri sidesteps this by making HTTP requests through the Rust side (`tauri-plugin-http`) rather than the webview's `fetch`.

## BYO-AI mechanics (Tier 2+, recorded early because it shaped the shell choice)

- Claude subscription → `claude -p "<prompt>"` (headless mode of Claude Code, uses the user's Pro/Max login).
- ChatGPT subscription → `codex exec "<prompt>"` (uses the user's ChatGPT login).
- Tauri's shell/process plugin spawns these; availability detection = probe binary on PATH at settings screen.
- All invocations logged (prompt + response) to a local log the UI can render.

## Repo layout (target, next milestone)

```
Fotion/
├── src/                  # React UI
│   ├── views/            # daily / timeline / weekly / settings
│   ├── components/
│   └── lib/aw/           # AW API client + query builders
├── src-tauri/            # Rust shell
├── docs/                 # SPEC.md / ARCHITECTURE.md (this file)
└── README.md
```
