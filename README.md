# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Using pnpm

From the `my-project` directory:

```bash
pnpm install
pnpm dev
```

This will install dependencies and start the Vite dev server (usually at `http://localhost:5173/`).

## Changesets workflow

This project uses [Changesets](https://github.com/changesets/changesets) to track changes and manage versions.

### Create a changeset

After making changes you want to release:

```bash
pnpm run cs:prepare
```

Follow the prompts to select the release type and add a summary.  
This creates a file in the `.changeset` directory describing the change.

### Apply versions and update changelog

When you are ready to cut a new version:

```bash
pnpm run cs:version
```

This will:

- Bump the version in `package.json`
- Generate or update `CHANGELOG.md`

Then commit and push the changes:

```bash
git add .
git commit -m "chore: release"
git push
```

## Git hooks & commit style

This project uses [Husky](https://typicode.github.io/husky) and [Commitlint](https://commitlint.js.org/#/) to enforce commit message style and run checks before commits.

### Setup (one time)

From the `my-project` directory:

```bash
pnpm install
```

This runs `husky install` via the `prepare` script and sets up Git hooks.

### Hooks

- **pre-commit**: runs `pnpm lint`
  - Prevents commits if ESLint fails.
- **commit-msg**: runs Commitlint with the conventional config
  - Ensures commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.

### Commit message examples

Valid examples:

- `feat: add dashboard cards`
- `fix: handle null data in chart`
- `chore: update dependencies`
- `docs: add setup instructions`

If a commit message does not follow this format, the commit will be rejected until the message is fixed.

## Formatting

This project uses [Prettier](https://prettier.io/) for code formatting.

To format the source files (React components, JS/TS, CSS, and Markdown), run:

```bash
pnpm format:fix
```

This will run Prettier with the project’s config and write changes to disk.
