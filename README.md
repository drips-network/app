banana# Drips App V2

This repo contains the in-development Drips App V2, which will allow users to create and manage streams on the Radicle Drips protocol, as well as provide developers with an interface for inspecting streams.

## Development

Setup:

```bash
npm install
```

To run a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Tests

Tests are setup with `vitest` as a runner, and `playwright` as the E2E test environment. Components can be unit-tested using `jsdom` (check `$lib/components/example/example.test.ts` for an example).

Run all tests:

```bash
npm run test
```
