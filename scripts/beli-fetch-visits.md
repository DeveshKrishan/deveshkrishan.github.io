# Refreshing the Beli restaurants widget

The "recent restaurants visited" column reads `ui/src/data/beli-visits.json`, which is
**committed to the repo**. Nothing fetches Beli at runtime, so the deployed site holds
no Beli credentials and cannot break when Beli changes an endpoint.

Refresh it whenever you want the site to show newer visits. A GitHub Action also
runs daily on `main` (`Refresh Beli visits`) and commits the file only when the
list actually changes. You can trigger that workflow by hand from the Actions tab.

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
rating events, and rewrites `ui/src/data/beli-visits.json`. It refuses to write an empty
file, so a bad run leaves the previous data intact.

Options:

```bash
node scripts/beli-fetch-visits.js --limit 5   # keep more entries (default 3)
node scripts/beli-fetch-visits.js --raw       # print the raw feed instead of writing
```

## Step 3: Commit the result (local refresh)

```bash
git add ui/src/data/beli-visits.json
git commit -m "chore: refresh beli visits"
```

The script leaves the file alone when the visit list is unchanged, so a scheduled
run does not create an empty commit.

## Cron (GitHub Actions)

The workflow lives at `.github/workflows/refresh-beli-visits.yml`. It needs two
repository secrets (Settings → Secrets and variables → Actions):

```
BELI_EMAIL
BELI_PASSWORD
```

Credentials stay in GitHub Actions. They are not stored on Vercel, and the
deployed site still only reads the committed JSON.

---

## Troubleshooting

- **403** — the backend rejects requests without an `Origin` header. The script sends one;
  if this starts failing, Beli likely changed its checks.
- **401 on login** — wrong credentials, or Beli throttled repeated logins. Wait and retry.
- **"No rating events found"** — the feed returned only bookmarks or other event types.
  Run with `--raw` to inspect what came back.
- **Fields come back empty** — the mapper in `ui/src/data/map-beli-visits.js` expects
  `business_full`, `score`, `sent_dt`, and `event_type`. These are observed field names,
  not a published contract, so they can change. Use `--raw` and adjust the mapper.
