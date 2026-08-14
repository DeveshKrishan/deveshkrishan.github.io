# How to get your Steam Web API key and SteamID64

You only need these once. Use the same values **locally** (`.env.local`) and on **Vercel**.

---

## Step 1: Get a Steam Web API key

1. Sign in at [Steam Web API Key Registration](https://steamcommunity.com/dev/apikey).
2. Register a domain (e.g. `deveshkrishan.github.io` or your Vercel deployment URL).
3. Copy the key → `STEAM_WEB_API_KEY`.

---

## Step 2: Get your SteamID64

**Option A – From your profile URL**

- If your URL is `https://steamcommunity.com/profiles/76561198…`, the number is your SteamID64 → `STEAM_ID`.

**Option B – Resolve a vanity URL**

If your URL is `https://steamcommunity.com/id/yourname`:

```bash
curl "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=YOUR_API_KEY&vanityurl=yourname"
```

The `steamid` field in the response is your SteamID64. Alternatively, set `STEAM_VANITY_URL=yourname` and the API route will resolve it at runtime.

**Option C – Third-party lookup**

Use [steamid.io](https://steamid.io) or [steamidfinder.com](https://steamidfinder.com).

---

## Step 3: Set profile privacy

Your **Game details** must be **Public** for the API to return recent games:

1. Go to [Steam Privacy Settings](https://steamcommunity.com/my/edit/settings).
2. Set **Game details** to **Public**.

---

## Step 4: Add env vars

Local (`.env.local`):

```bash
STEAM_WEB_API_KEY=...
STEAM_ID=76561198...
```

Vercel: Project → Settings → Environment Variables → add the same keys.

Test locally:

```bash
pnpm run dev:full
curl "http://localhost:3000/api/steam/recent-games?limit=3"
```
