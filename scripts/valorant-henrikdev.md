# How to wire VALORANT into the games widget (HenrikDev)

Valorant is **not** on Steam, and Tracker Network does not offer a public Valorant API.
This site uses [HenrikDev](https://docs.henrikdev.xyz) for last-played and playtime in the
last two weeks, then merges that row into `/api/steam/recent-games` with your Steam titles.

---

## Step 1: Create a HenrikDev API key

1. Open the [HenrikDev dashboard](https://api.henrikdev.xyz/dashboard/).
2. Generate an API key.
3. Set `HENRIKDEV_API_KEY` locally and on Vercel.

---

## Step 2: Set your Riot ID

From the Riot Client (e.g. `Solo#NA1`):

```bash
VALORANT_NAME=Solo
VALORANT_TAG=NA1
```

Optional overrides:

```bash
# Usually inferred from the account endpoint
# VALORANT_REGION=na
# VALORANT_PLATFORM=pc
```

---

## Env checklist

```bash
HENRIKDEV_API_KEY=...
VALORANT_NAME=...
VALORANT_TAG=...
# optional:
# VALORANT_REGION=na
# VALORANT_PLATFORM=pc
```

If any of the three required vars are missing, the games widget stays Steam-only.
Playtime is the sum of match lengths from the last 14 days (not lifetime hours).
HenrikDev’s live match list is capped at 10 games, so two-week totals also
include stored match history. Exact v4 durations win when both exist; older
matches are estimated from mode and round scores.
