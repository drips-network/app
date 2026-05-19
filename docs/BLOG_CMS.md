# Blog CMS (Keystatic)

Marketing edits blog posts at `/keystatic` using [Keystatic](https://keystatic.com/), a git-based CMS. Saves open a pull request against `main`; a maintainer reviews and merges to publish.

- Posts live in `src/blog-posts/*.md` (markdown + YAML frontmatter)
- Authors live in `src/blog-posts/authors/*.json`
- Cover images live in `static/assets/blog-images/`
- Author avatars live in `static/assets/blog-images/authors/`
- Schema is defined in `keystatic.config.ts` at the repo root

The CMS UI is mounted by the `keystatic-sveltekit` Vite plugin (see `vite.config.ts`) and the SvelteKit hook in `src/hooks.server.ts`. The TS config is loaded by Node at startup using `--experimental-strip-types` (set in the `dev` and `build:app` scripts in `package.json`).

## Local development

```sh
npm run dev
```

Then visit `http://localhost:5173/keystatic`. In dev, storage is `local` — saves write straight to your working tree (no PRs).

## Production setup (one-time)

In production, Keystatic uses GitHub storage. Each save creates a branch prefixed with `cms/` and opens a PR against `main`.

### 1. Create a GitHub App

Visit `https://drips.network/keystatic` (or wherever the app is deployed) while logged in to GitHub as a repo admin. Click **Set up Keystatic with GitHub** and follow the prompts — Keystatic will create the app for you with the right permissions and write the env vars to your clipboard.

If you'd rather create the app manually, it needs:
- **Repository permissions**: Contents `read & write`, Metadata `read`, Pull requests `read & write`, Workflows `read & write`
- **Callback URL**: `https://<your-domain>/api/keystatic/github/oauth/callback`
- **Setup URL**: `https://<your-domain>/keystatic/setup`
- **Webhook**: not required

### 2. Set env vars on the deployment

```
KEYSTATIC_GITHUB_CLIENT_ID=<from GitHub App>
KEYSTATIC_GITHUB_CLIENT_SECRET=<from GitHub App>
KEYSTATIC_SECRET=<random 32-byte hex string>
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=<the GitHub App's slug>
```

Generate `KEYSTATIC_SECRET` with `openssl rand -hex 32`.

### 3. Install the GitHub App on the repo

Install the GitHub App on `drips-network/app`, granting it access to that repo only.

### 4. Give marketing users access

Anyone with write access to `drips-network/app` (or any repo where the GitHub App is installed) can log in to the CMS. To grant a marketing teammate access, add them to the repo as a collaborator with `write` permission (no other GitHub permissions needed beyond an account).

## Workflow

1. Marketing opens `https://drips.network/keystatic`, signs in with GitHub
2. They create or edit a post; clicking **Save** opens a PR titled e.g. `Update post: <slug>` on a branch `cms/<id>`
3. Reviewer merges; the deploy pipeline publishes the new post

## Schema notes

`keystatic.config.ts` mirrors `metadataSchema` in `src/routes/api/blog/posts/schema.ts`. If you add or remove a frontmatter field, update **both** files.

The `BLOG_CATEGORY_OPTIONS` list in `keystatic.config.ts` is duplicated from `BLOG_CATEGORIES` / `BLOG_CATEGORY_LABELS` in the schema file. This is intentional — `keystatic.config.ts` is loaded by Node at Vite startup (before TS source resolution), so it can't import from `src/`. Keep the two lists in sync.

## Known limitations / follow-ups

- **Inline Svelte components in posts are not editable as blocks.** Several existing posts contain `<BlogVideoPlayer />`, `<BlogDripListCard />`, etc. embedded directly in the markdown body. The CMS body editor shows these as raw text, not a visual block. Marketing can leave them alone or edit the surrounding text, but they can't insert new ones from the editor. To get a proper block menu, the renderer would need to migrate from `mdsvex` to a Markdoc-based pipeline (`markdoc-svelte`) — tracked as a follow-up.
