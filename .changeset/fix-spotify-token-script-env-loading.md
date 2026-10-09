---
"devesh-portfolio": patch
---

Fix the Spotify refresh-token script failing to find credentials when a Vercel-generated `.env.local` exists. It now merges `.env` and `.env.local` instead of reading only the first file found.
