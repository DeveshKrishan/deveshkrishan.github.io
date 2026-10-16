#!/usr/bin/env bash
# Grid cells are ~760px wide on a 1440p monitor. 1280px thumbs stay sharp at 1x
# and hold up at 1.25–1.5x scaling without pulling the 4k full files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PHOTOS="$ROOT/ui/public/photos"
THUMBS="$PHOTOS/thumbs"
WIDTH=1280
QUALITY=72

mkdir -p "$THUMBS"

shopt -s nullglob
for src in "$PHOTOS"/*.jpeg "$PHOTOS"/*.jpg; do
  name="$(basename "$src")"
  dest="$THUMBS/$name"
  sips \
    --resampleWidth "$WIDTH" \
    --setProperty format jpeg \
    --setProperty formatOptions "$QUALITY" \
    "$src" \
    --out "$dest" \
    >/dev/null
  echo "$name"
done
