# How to get your Spotify refresh token (once)

You only need **one** refresh token. Get it once, then use the same value **locally** and on **Vercel**.

---

## Step 1: Add redirect URI in Spotify Dashboard

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → your app.
2. Open **Settings** → **Redirect URIs**.
3. Add: `http://127.0.0.1:8888/callback` (use exactly this for local; do not use `localhost`).
4. Save.

---

## Step 2: Get the refresh token (run locally)

**Option A – Use the script (easiest)**

From the project root, with your `.env` or `.env.local` containing `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`:

```bash
node scripts/spotify-get-refresh-token.js
```

The script will:

1. Start a small server on `http://127.0.0.1:8888`.
2. Open your browser to Spotify’s authorize page.
3. After you log in and approve, Spotify redirects back with a `code`.
4. The script exchanges the code for tokens and prints the **refresh_token** in the terminal.

Copy that refresh token; you’ll use it in Step 3.

**Option B – Manual (browser + curl)**

1. Build the authorize URL (encode the redirect URI):

   ```
   https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&scope=user-read-recently-played
   ```

2. Open that URL in your browser, log in, and approve. You’ll be redirected to something like:
   `http://127.0.0.1:8888/callback?code=AQB...`  
   (The page may say “site can’t be reached” – that’s fine. Copy the `code` from the URL.)

3. Exchange the code for tokens:

   ```bash
   curl -X POST https://accounts.spotify.com/api/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
     -d "grant_type=authorization_code" \
     -d "code=PASTE_THE_CODE_FROM_URL" \
     -d "redirect_uri=http://127.0.0.1:8888/callback"
   ```

4. From the JSON response, copy the `refresh_token` value.

---

## Step 3: Use the same refresh token everywhere

- **Locally**  
  Put it in `.env` or `.env.local`:
  ```
  SPOTIFY_CLIENT_ID=...
  SPOTIFY_CLIENT_SECRET=...
  SPOTIFY_REFRESH_TOKEN=the_refresh_token_you_just_copied
  ```
  Then run your app (e.g. `vercel dev` or `pnpm dev` with the API proxied) so `/api/spotify/recently-played` can read these.

- **Vercel (deploy)**  
  1. Vercel → your project → **Settings** → **Environment Variables**.
  2. Add:
     - `SPOTIFY_CLIENT_ID` = (same as local)
     - `SPOTIFY_CLIENT_SECRET` = (same as local)
     - `SPOTIFY_REFRESH_TOKEN` = (the **same** refresh token you use locally)
  3. Redeploy so the new env vars are applied.

You do **not** get a different refresh token “when you deploy.” You get it once (locally via the script or manual flow) and reuse it in both local and Vercel env.

**Scope used:** `user-read-recently-played` only (minimum needed for recently played).
