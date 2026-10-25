# my-project

## 0.24.1

### Patch Changes

- 6610988: Use the VALORANT logo on the recent games row, and add a readiness check for API configuration.

## 0.24.0

### Minor Changes

- dbe44d3: Add a homepage column for the three most recent YouTube uploads with view counts and duration.

## 0.23.1

### Patch Changes

- 5fb3abe: Move the two-week playtime window onto the recent games heading and drop VALORANT rank and level.

## 0.23.0

### Minor Changes

- cd500db: Add Alcatraz Island and Berryessa BART frames to the recent shots gallery.

## 0.22.1

### Patch Changes

- f576393: Show Steam playtime as time played in the last two weeks, matching VALORANT.
- f576393: Count VALORANT two-week playtime from stored match history so sessions beyond the last 10 games are included.

## 0.22.0

### Minor Changes

- Show VALORANT playtime as time played in the last two weeks from recent matches.

## 0.21.0

### Minor Changes

- Show current VALORANT rank (icon + title) on the recent games row and add a Valorant mark to the source credit.

## 0.20.0

### Minor Changes

- Merge VALORANT into the recent games column via HenrikDev (last played, level, optional seeded hours) alongside Steam.

## 0.19.6

### Patch Changes

- b7d4d91: Remove photos from the navbar and rename the gallery heading to recent shots.

## 0.19.5

### Patch Changes

- 6064c15: Match the Steam achievement meter to the last-played date, rename restaurants to rated, and zoom photo thumbs on hover.

## 0.19.4

### Patch Changes

- Sharpen photo grid previews with 1280px thumbs so they stay crisp on 1440p monitors.

## 0.19.3

### Patch Changes

- Credit Apple Photos on the recent frames section.

## 0.19.2

### Patch Changes

- Add a thin progress meter under Steam achievement counts.

## 0.19.1

### Patch Changes

- 579e88f: Show the three most recently played Steam games instead of only the last two weeks.

## 0.19.0

### Minor Changes

- 3e8855e: Show Steam achievement progress on each recent game in the activity section.

## 0.18.1

### Patch Changes

- 91d42b0: Track each photo open in Vercel Analytics so the dashboard can show which frames get viewed.

## 0.18.0

### Minor Changes

- 09f0ea1: Add a recent frames strip and fullscreen photo viewer under the activity section.

## 0.17.2

### Patch Changes

- Create a GitHub release automatically when a versioned change lands on main.

## 0.17.1

### Patch Changes

- Document homepage integrations in the README with Mermaid diagrams.

## 0.17.0

### Minor Changes

- Show Google Places thumbnails next to recent Beli restaurant visits.

## 0.16.0

### Minor Changes

- Improve Google results for Devesh Krishan with a photo preview, Person schema, a name heading, and a redirect from the default Vercel URL to the custom domain.

## 0.15.10

### Patch Changes

- Add Vercel Speed Insights to collect Core Web Vitals on the live site.

## 0.15.9

### Patch Changes

- Fix the daily Beli visits refresh workflow after the TypeScript migration by loading the shared `.ts` mapper with tsx.

## 0.15.8

### Patch Changes

- Fix large-phone intro layout so skills fit beside the photo, and replace the mobile menu text with a hamburger icon.

## 0.15.7

### Patch Changes

- Add a divider between the skills chips and GitHub activity to match the intro rule.

## 0.15.6

### Patch Changes

- Show visitor-friendly widget errors and remove unused image assets.

## 0.15.5

### Patch Changes

- Add robots.txt and a homepage sitemap so search engines can crawl the site cleanly.

## 0.15.4

### Patch Changes

- Restore unique visitors and other homepage widgets by fixing Vercel TypeScript function compile and ESM helper imports.

## 0.15.3

### Patch Changes

- Migrate the UI and API to TypeScript with strict type-checking.

## 0.15.2

### Patch Changes

- Clarify the footer as unique visitors, drop unused Tremor and Heroicons, and add homepage SEO metadata.

## 0.15.1

### Patch Changes

- 7df6b98: Keep API helpers and tests out of the Vercel Hobby serverless-function limit.

## 0.15.0

### Minor Changes

- ac496fa: Add a footer visitor count from Vercel Web Analytics.

## 0.14.0

### Minor Changes

- 44953c5: Add a mobile menu overlay for the navbar, with menu/close controls and stacked links.

## 0.13.0

### Minor Changes

- d6fc4b6: Add a black dithered mountain backdrop behind the GitHub activity card.
- d6fc4b6: Add a GitHub activity card with contribution heatmap under homepage skills, and stretch the profile photo to match the intro column on large screens.
- d6fc4b6: Hide the navbar while scrolling down and bring it back when scrolling up.

### Patch Changes

- d6fc4b6: Stop stretching homepage skill groups to the photo height on large screens.

## 0.12.1

### Patch Changes

- b948c16: Add C++ and Kafka to the homepage skills chips.

## 0.12.0

### Minor Changes

- b61d9a6: Add scroll fade-in, photo hover, and skeleton loaders for Spotify and Steam.

## 0.11.1

### Patch Changes

- Update the intro bio with UCI alumni and SF Bay Area copy, and shrink the profile photo.

## 0.11.0

### Minor Changes

- Stretch the homepage wordmark across both names and fill leftover intro space with skills beside the photo.

## 0.10.1

### Patch Changes

- Split the Vite app into `ui/` and keep Node API routes at `api/` in a pnpm workspace, with one Vercel project serving both.

## 0.10.0

### Minor Changes

- Restyle the site after Squarespace Reseda Fluid, fold skills into the intro, and hide the GitHub commits column.

## 0.9.0

### Minor Changes

- Refresh Beli restaurant visits, show cuisine chips and the Beli logo, and add a daily GitHub Action to update the committed visit list.

## 0.8.0

### Minor Changes

- 02b76e5: Add a "recent restaurants visited" column to the homepage activity section, rendered from a committed JSON file that is refreshed locally by `scripts/beli-fetch-visits.js`.

## 0.7.2

### Patch Changes

- 1f98703: Fix the Spotify refresh-token script failing to find credentials when a Vercel-generated `.env.local` exists. It now merges `.env` and `.env.local` instead of reading only the first file found.

## 0.7.1

### Patch Changes

- b54e7f8: Show only public GitHub commits in the homepage activity widget.

## 0.7.0

### Minor Changes

- 8964639: Add an email contact icon to the homepage introduction section with a mailto link.

## 0.6.5

### Patch Changes

- ce7a420: Update the homepage profile photo and improve circular crop positioning for the new image.

## 0.6.4

### Patch Changes

- 09f6275: Add spacing between activity section columns and prevent long commit messages from overflowing into adjacent columns.

## 0.6.3

### Patch Changes

- f8dd118: Hide the resume link in the navbar behind a feature flag.

## 0.6.2

### Patch Changes

- 875fb11: Show only the commit subject line in the recent commits activity widget.

## 0.6.1

### Patch Changes

- e5ed9d2: Add API Checks CI workflow and Vitest unit tests for GitHub, Steam, and Spotify backend mappers.

## 0.6.0

### Minor Changes

- 915d626: Add a resume link to the navbar that opens the hosted PDF in a new tab.

## 0.5.0

### Minor Changes

- a4baadb: Enhance Spotify recently played tracks with album art, deduplicated entries, play times, and links to songs and artists. Add Vitest UI tests and a UI checks CI workflow.

## 0.4.1

### Patch Changes

- 12cd6f4: Add a GitHub Actions workflow that runs Commitlint on pull request commits.

## 0.4.0

### Minor Changes

- Add Steam recent games widget with game icons to the activity section.

## 0.3.1

### Patch Changes

- Make the navbar and “coded by devesh” logo bounce on hover (scale, larger then smaller).

## 0.3.0

### Minor Changes

- ca570e5: Add a grouped skills section below the introduction with classic portfolio styling, plus mobile/layout polish (consistent font inheritance and normalized header-to-content spacing).

### Patch Changes

- 3137b39: Add Cursor rule documenting GitHub release workflow with Changesets and auto-generated release notes.

## 0.2.0

### Minor Changes

- 947ad5c: Add Spotify and GitHub activity widgets to the homepage activity section.

### Patch Changes

- fdc0042: Small navigation, layout, and intro section fixes for the home and about sections.

## 0.1.1

### Patch Changes

- remove projects

## 0.1.0

### Minor Changes

- add spotify integration for seeing most recent songs played

## 0.0.2

### Patch Changes

- update about me and info about recent songs and commits

## 0.0.1

### Patch Changes

- changed bg, removed skills, and add pfp
