# Leonida Trophy Guide — GTA VI (PS5)

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of
Grand Theft Auto VI: the official list with saved progress, filters and a
spoiler setting, a roadmap to the platinum, and a guide to each trophy that
cites its sources.

Built for the make.fun bounty **Build the best GTA 6 trophy guide**:
https://make.fun/bounty/gta6-trophy-guide-01

## What it does

- **Checklist of all 55 trophies** — every trophy with its official name,
  description and grade (1 platinum, 2 gold, 6 silver, 46 bronze), exactly as
  PlayStation publishes them.
- **A guide to every trophy, in our own words** — what to do, where and how,
  and when it can be missed, with step-by-step instructions and named sources
  beside each guide (GTABase, Push Square, EGamers, GTA Spotter, Insider
  Gaming). Five trophies whose unlock method was unconfirmed at the time of
  writing are marked as such rather than guessed.
- **Progress tracker** — tick trophies off; progress is saved in the browser
  (localStorage), with export to and import from a `.json` file.
- **Filters** — by kind (story, character quests, collectibles, activities,
  combat & robberies, one-off moments, 100% completion, platinum), by grade,
  by earned/remaining, missable-only, plus full-text search.
- **Spoiler-free mode (on by default)** — hides the names and descriptions of
  the 28 hidden story trophies until they are ticked earned.
- **Roadmap to the platinum** — three stages (story → 100% checklist →
  Strangers & Freaks and clean-up) with time estimates and per-stage trophy
  lists that reflect your progress.
- **Missable & warnings** — the one possibly missable trophy (Positive Mental
  Attitude, with the Chapter 1 balcony meditation), the cheat warning, the
  permanent Irredeemable profile warning, and the unconfirmed-trophy notes.
- **Fully offline** — static files only; the app loads nothing over the
  network. Source links open only if the reader follows them.
- **Original look** — no Rockstar logo, official artwork, box art or game
  screenshot anywhere.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

Requires Node.js 22.18 or later (only the standard library is used).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` validates `app/data/trophies.json` (exactly 55 trophies, the right
grade split, every guide non-blank), copies `app/` and `screenshots/` to the
output directory, and writes `dossier.json` with the vendored make.fun
library (`vendor/makefun-frontend.ts`, copied from the kit unchanged).

## Layout

- `main.ts` — entrypoint (Node 22): validates, copies, builds the dossier.
- `serve.ts` — local static server for trying the guide.
- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself.
- `app/data/trophies.json` — the 55 trophies with guides, steps, sources,
  kinds, difficulty ratings, roadmap stages and missable flags.
- `screenshots/` — 4 real renders of the guide (1280×800).
- `shots.json` — what each screenshot shows.
- `vendor/makefun-frontend.ts` — make.fun library, unchanged from the kit.

## Sources

Trophy list: Exophase and PSNProfiles (agreeing on every name, description
and grade). Unlock details and roadmap: GTABase, Push Square, EGamers, GTA
Spotter, Insider Gaming — each guide cites its sources; see the Sources &
About tab in the app. Guide text is original; the official trophy names and
descriptions are the exception, shown as PlayStation publishes them.

## Disclaimer

Unofficial fan guide. Not affiliated with, endorsed by, or connected to
Rockstar Games, Take-Two Interactive, or PlayStation.
