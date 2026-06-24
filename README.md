# Waxball HQ

A static Sleeper Fantasy Football dashboard for Waxball, built around the
current season with a separate 2025 archive.

## Use it

Open `index.html` in a browser. The current 2026 Waxball league is preloaded
with this Sleeper league ID:

```text
1312219624808419328
```

The 2025 archive lives at `archive-2025.html` and uses:

```text
1253094778665439232
```

There is no public league picker or connect form in the site. League IDs are
configured in `app.js` so the published page stays focused on Waxball.

To change league IDs later, edit `app.js`:

```js
const CURRENT_LEAGUE_ID = "YOUR_CURRENT_SLEEPER_LEAGUE_ID";
const ARCHIVE_2025_LEAGUE_ID = "YOUR_ARCHIVE_SLEEPER_LEAGUE_ID";
```

## Data

The page uses Sleeper's public read-only API for:

- League details
- Rosters and standings
- League users and team names
- Current NFL week
- Weekly matchups
- Last-season history from `previous_league_id` when Sleeper exposes one
- Winners and losers brackets
- Completed waiver, free agent, and trade transactions
- NFL schedule context from ESPN's public scoreboard endpoint
- Non-linking football context for injury, depth-chart, and gameday watch items

The current league is in `pre_draft` state, so matchups will appear after the
draft and Sleeper schedule generation.

No API token is required.
