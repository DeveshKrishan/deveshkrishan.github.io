# How to wire VALORANT into the games widget (HenrikDev)

Valorant is **not** on Steam, and Tracker Network does not offer a public Valorant API.
This site uses [HenrikDev](https://docs.henrikdev.xyz) for last-played + account level, then
merges that row into `/api/steam/recent-games` with your Steam titles.

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

## Step 3: Seed total hours (recommended)

HenrikDev does not expose reliable lifetime playtime. Set minutes from your
[tracker.gg](https://tracker.gg/valorant) profile (or any hours counter you trust):

```bash
# Example: 122 hours → 7320 minutes
VALORANT_PLAYTIME_MINUTES=7320
```

Without this, VALORANT still appears with last played + account level, but no hours line.

---

## Env checklist

```bash
HENRIKDEV_API_KEY=...
VALORANT_NAME=...
VALORANT_TAG=...
# optional:
# VALORANT_REGION=na
# VALORANT_PLATFORM=pc
# VALORANT_PLAYTIME_MINUTES=7320
```

If any of the three required vars are missing, the games widget stays Steam-only.
