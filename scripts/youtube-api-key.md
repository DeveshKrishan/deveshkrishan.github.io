# How to get a YouTube Data API key

You only need this once. Use the same value **locally** (`.env`) and on **Vercel**.

The homepage widget reads the public [Devalisk Edits](https://www.youtube.com/@devaliskedits3290/videos) uploads playlist. An API key is enough — no OAuth.

---

## Step 1: Enable YouTube Data API v3

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Use the same project as Places, or create a new one.
3. Go to **APIs & Services → Library**.
4. Enable **YouTube Data API v3**.

---

## Step 2: Create an API key

1. Go to **APIs & Services → Credentials → Create credentials → API key**.
2. Restrict the key to **YouTube Data API v3**.
3. Copy the key → `YOUTUBE_API_KEY`.

The existing `GOOGLE_PLACES_API_KEY` is usually restricted to Places and will return 403 for YouTube.

---

## Step 3: Set the env var

Local `.env`:

```bash
YOUTUBE_API_KEY=...
```

Optional overrides (defaults already match this channel):

```bash
YOUTUBE_CHANNEL_ID=UCqN3hQCQMaNG2lroc3uhfCQ
YOUTUBE_CHANNEL_HANDLE=devaliskedits3290
```

On Vercel, add `YOUTUBE_API_KEY` for production, preview, and development.

---

## Quota

Each homepage load uses 2 API units (`playlistItems.list` + `videos.list`), cached for 5 minutes. The default quota is 10,000 units/day.
