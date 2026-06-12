# Fotion

**An open-source, local-first productivity tracker — your data on your machine, AI powered by your own subscriptions.**

Fotion is an open-source alternative to [Rize.io](https://rize.io). It renders beautiful dashboards and timelines on top of [ActivityWatch](https://activitywatch.net)'s battle-tested local collection engine, and (in later phases) adds AI-powered categorization and gentle interventions — using the AI subscriptions you already pay for (Claude, ChatGPT) instead of charging you another monthly fee.

> Status: **pre-alpha**. Spec phase — see [docs/SPEC.md](docs/SPEC.md).

## Why

- **Rize is great, but closed and subscription-only.** Your activity data lives on someone else's server.
- **ActivityWatch is great, but it's an engine, not a product.** The bundled UI is functional, not motivating.
- **You already pay for AI.** Claude Pro/Max or ChatGPT subscriptions can power categorization and coaching locally — no extra API bill, no data leaving your machine except the prompts you approve.

## Core concept

```
ActivityWatch (collection engine)        Fotion (this project)
┌─────────────────────────────┐      ┌──────────────────────────────┐
│ aw-watcher-window            │      │ Tauri desktop app            │
│ aw-watcher-afk               │ REST │  • Daily dashboard           │
│ aw-server (SQLite, local)    │◄─────┤  • Timeline view             │
│                              │      │  • Weekly trends             │
└─────────────────────────────┘      │  • (later) AI categorize     │
                                      │  • (later) interventions     │
                                      └──────────────────────────────┘
```

- **Local-first**: all data stays in ActivityWatch's local SQLite. Fotion reads it over the localhost REST API.
- **BYO-AI**: AI features call your own Claude / ChatGPT subscription through their local CLIs (`claude`, `codex`) — opt-in, transparent, never required for core dashboards.
- **Open source**: MIT licensed.

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| **Tier 1** | Read-only dashboards: daily dashboard, timeline view, weekly trends | **in progress** |
| Tier 2 | Derived layer: category rules, session detection, focus score, AI-assisted categorization (BYO subscription) | planned |
| Tier 3 | Interventions: menu bar widget, "you've been on YouTube for 40 min" nudges, break reminders | planned |
| Tier 4 | AI coaching: daily summaries and insights via your own subscription | planned |

See [docs/SPEC.md](docs/SPEC.md) for the full product spec and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical decisions and verified ActivityWatch behavior.

## Development

Prerequisites: [ActivityWatch](https://activitywatch.net) running locally (`brew install --cask activitywatch`), Node 22+, pnpm, Rust (for Tauri).

```bash
# (scaffold coming in the next milestone)
pnpm install
pnpm tauri dev
```

## License

[MIT](LICENSE)
