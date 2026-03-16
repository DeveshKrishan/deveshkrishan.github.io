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
