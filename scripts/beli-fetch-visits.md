# Refreshing the Beli restaurants widget

The "recent restaurants visited" column reads `src/data/beli-visits.json`, which is
**committed to the repo**. Nothing fetches Beli at runtime, so the deployed site holds
no Beli credentials and cannot break when Beli changes an endpoint.

Refresh it whenever you want the site to show newer visits.

---

## Why it works this way

Beli has no public API, no API key, and no OAuth. The only way in is logging in with
your real account email and password, and the backend is private and reverse-engineered
(see [ProjectBarks/beli-api](https://github.com/ProjectBarks/beli-api)).

Putting those credentials on Vercel would mean storing your actual Beli password in a
serverless function, against Beli's terms, on endpoints that can break without notice.
Generating the JSON locally avoids all of that.

---

## Step 1: Add credentials to `.env`

`.env` is gitignored. Add:

```
BELI_EMAIL=you@example.com
BELI_PASSWORD=your-beli-password
```

## Step 2: Run the script

```bash
node scripts/beli-fetch-visits.js
```

It logs in, resolves your user id, reads your profile feed, keeps the most recent
rating events, and rewrites `src/data/beli-visits.json`. It refuses to write an empty
file, so a bad run leaves the previous data intact.

Options:

```bash
node scripts/beli-fetch-visits.js --limit 5   # keep more entries (default 3)
node scripts/beli-fetch-visits.js --raw       # print the raw feed instead of writing
```

## Step 3: Commit the result

```bash
git add src/data/beli-visits.json
git commit -m "chore: refresh beli visits"
```

---

## Troubleshooting

- **403** — the backend rejects requests without an `Origin` header. The script sends one;
  if this starts failing, Beli likely changed its checks.
- **401 on login** — wrong credentials, or Beli throttled repeated logins. Wait and retry.
- **"No rating events found"** — the feed returned only bookmarks or other event types.
  Run with `--raw` to inspect what came back.
- **Photos are missing** — thumbnails come from Google Places at request time, keyed by the
  `placeId` in the generated JSON, not from Beli. The feed carries no photo urls at all.
  Check `GOOGLE_PLACES_API_KEY` and `/api/places/photos`.
- **Fields come back empty** — the mapper in `src/data/map-beli-visits.js` expects
  `business_full`, `score`, `sent_dt`, and `event_type`. These are observed field names,
  not a published contract, so they can change. Use `--raw` and adjust the mapper.
