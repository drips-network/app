# App in a ryph run

This is the SvelteKit frontend (`drips-network/app`), sharing a workspace
image with `wave/` — see `wave/.ryph/Dockerfile` for what the machine
carries. There is no Docker here: `npm run dev:docker`, `npm run
test:e2e`/`test:e2e:headless` (which drive `docker/start-e2e.sh`, spinning up
a full local chain + subgraph + GQL API + Wave stack) and anything else in
AGENTS.md that shells out to `docker compose` will not work. Don't try to
install Docker.

Setup has already run `npm install --prefer-offline` and downloaded
Playwright's Chromium and Firefox browser binaries (the matching OS-level
libraries are baked into the image). Every run repeats both steps, so they
are fast when the lockfile and browsers haven't changed.

## Running the checks

- Unit tests: `npm run test:unit` — self-contained, sets its own env vars
  inline, no `.env` file or backend needed.
- Type/template checking: `npm run check` (runs `svelte-kit sync &&
  svelte-check`). This needs generated GraphQL types under
  `src/**/__generated__/`, produced by `npm run gql:build`, which downloads
  the live schema from `PUBLIC_GQL_URL` (e.g.
  `https://gql-api.drips.network/`) — reaching that host depends on the
  run's network policy. Without it, `npm run check` fails with a large
  baseline of errors that predates any change you make; grep the output for
  your own files rather than expecting a clean run.
- Linting/formatting: `npx lint-staged --concurrent false` (staged files
  only) — of limited use outside a real staged diff.

## Using Playwright to view the dev server

Playwright (chromium + firefox) is installed and ready to drive a browser,
independent of the full E2E suite. Start the plain dev server with `npm run
dev` (plain `vite dev`, not the Docker-based one) and point Playwright or any
`@playwright/test` script at `http://localhost:5173`. Expect requests that
need a live backend (Wave API, GraphQL API, on-chain data, etc.) to fail
unless the corresponding `PUBLIC_*_URL` env vars in `.env` point at reachable
services — see `.env.template` — the dev server itself only needs `vite` to
start.

Running the actual `test:e2e*` npm scripts is out of scope here: they orchestrate
the full Docker Compose stack (`docker-compose.e2e.yml`), which does not exist
in this environment.
