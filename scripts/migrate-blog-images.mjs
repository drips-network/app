#!/usr/bin/env node
// One-off migration: reorganize blog images into the per-entry subdirectory
// layout that Keystatic uses for fields.image and fields.markdoc body images.
//
// Layout after this runs:
//   static/assets/blog-images/{post-slug}/coverImage.{ext}    (cover)
//   static/assets/blog-images/{post-slug}/{filename}          (body)
//   static/assets/blog-images/authors/{author-id}/avatarUrl.{ext}
//
// Cover image filename becomes `coverImage.<ext>` because Keystatic names
// fields.image uploads after the field name. Body images keep their basename.
// Images referenced by multiple posts are COPIED into each post's subdir.

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, renameSync, rmSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, basename, extname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = resolve(repo, 'src/blog-posts');
const authorsDir = resolve(repo, 'src/blog-posts/authors');

const dryRun = process.argv.includes('--dry-run');
const log = (...a) => console.log(...a);

const ensureDir = (p) => mkdirSync(p, { recursive: true });
const move = (from, to) => {
  if (from === to) return;
  if (!existsSync(from)) {
    log(`  ! source missing, skip: ${from}`);
    return;
  }
  if (dryRun) return log(`  mv ${posix.relative(repo, from)} → ${posix.relative(repo, to)}`);
  ensureDir(dirname(to));
  try { renameSync(from, to); } catch { copyFileSync(from, to); rmSync(from); }
};
const copy = (from, to) => {
  if (from === to) return;
  if (!existsSync(from)) { log(`  ! source missing, skip: ${from}`); return; }
  if (dryRun) return log(`  cp ${posix.relative(repo, from)} → ${posix.relative(repo, to)}`);
  ensureDir(dirname(to));
  copyFileSync(from, to);
};

// 1. Parse posts: extract slug, coverImage path, and all body image refs.
const posts = readdirSync(postsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const slug = f.replace(/\.md$/, '');
    const path = resolve(postsDir, f);
    const content = readFileSync(path, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;
    const [, fm, body] = fmMatch;
    const coverMatch = fm.match(/^coverImage:\s*['"]?([^'"\n]+)['"]?\s*$/m);
    return { slug, path, fm, body, content, coverImage: coverMatch?.[1] };
  })
  .filter(Boolean);

// 2. Build usage map for body images (excluding /authors/ which we handle separately).
const bodyRefs = new Map(); // imagePath → Set<post.slug>
const bodyImgRegex = /\/assets\/blog-images\/(?!authors\/)([^)\s"'<>]+)/g;
for (const post of posts) {
  for (const m of post.body.matchAll(bodyImgRegex)) {
    const refPath = '/assets/blog-images/' + m[1];
    if (!bodyRefs.has(refPath)) bodyRefs.set(refPath, new Set());
    bodyRefs.get(refPath).add(post.slug);
  }
}

// 3. Migrate cover images. Track which source files were used so we can clean up.
const consumedSources = new Set();
for (const post of posts) {
  if (!post.coverImage) continue;
  const ext = extname(post.coverImage).toLowerCase() || '.png';
  const oldAbs = resolve(repo, 'static' + post.coverImage);
  const newRel = `/assets/blog-images/${post.slug}/coverImage${ext}`;
  const newAbs = resolve(repo, 'static' + newRel);
  if (post.coverImage === newRel) continue;
  log(`[cover] ${post.slug}: ${post.coverImage} → ${newRel}`);
  copy(oldAbs, newAbs);
  consumedSources.add(oldAbs);
  // Update frontmatter
  const updatedFm = post.fm.replace(/^coverImage:\s*['"]?[^'"\n]+['"]?\s*$/m, `coverImage: '${newRel}'`);
  const updatedContent = `---\n${updatedFm}\n---\n${post.body}`;
  if (!dryRun) writeFileSync(post.path, updatedContent);
  post.fm = updatedFm;
  post.content = updatedContent;
}

// 4. Migrate body images. Reload post bodies (cover updates didn't touch body).
for (const [refPath, slugSet] of bodyRefs) {
  const oldAbs = resolve(repo, 'static' + refPath);
  const slugs = [...slugSet];
  const filename = basename(refPath);
  for (const slug of slugs) {
    const newRel = `/assets/blog-images/${slug}/${filename}`;
    const newAbs = resolve(repo, 'static' + newRel);
    if (refPath === newRel) continue; // already in the right place
    log(`[body]  ${slug}: ${refPath} → ${newRel}${slugs.length > 1 ? `  (shared by ${slugs.length} posts)` : ''}`);
    if (slugs.length === 1) move(oldAbs, newAbs); else copy(oldAbs, newAbs);
    // Update the post body
    const post = posts.find((p) => p.slug === slug);
    if (!post) continue;
    // Escape regex special chars in refPath
    const escaped = refPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    post.body = post.body.replace(new RegExp(escaped, 'g'), newRel);
    post.content = `---\n${post.fm}\n---\n${post.body}`;
    if (!dryRun) writeFileSync(post.path, post.content);
  }
  if (slugs.length > 1) consumedSources.add(oldAbs); // also clean up shared sources after copying
  else consumedSources.add(oldAbs);
}

// 5. Migrate author avatars.
for (const file of readdirSync(authorsDir).filter((f) => f.endsWith('.json'))) {
  const authorId = file.replace(/\.json$/, '');
  const path = resolve(authorsDir, file);
  const json = JSON.parse(readFileSync(path, 'utf-8'));
  if (!json.avatarUrl) continue;
  const ext = extname(json.avatarUrl).toLowerCase() || '.png';
  const oldAbs = resolve(repo, 'static' + json.avatarUrl);
  const newRel = `/assets/blog-images/authors/${authorId}/avatarUrl${ext}`;
  const newAbs = resolve(repo, 'static' + newRel);
  if (json.avatarUrl === newRel) continue;
  log(`[avatar] ${authorId}: ${json.avatarUrl} → ${newRel}`);
  copy(oldAbs, newAbs);
  consumedSources.add(oldAbs);
  json.avatarUrl = newRel;
  if (!dryRun) writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
}

// 6. Clean up source files that were only consumed (i.e. copied from but never the destination).
for (const src of consumedSources) {
  if (!existsSync(src)) continue;
  // Don't delete files that ended up being the destination too (won't happen given our logic, but defensive)
  const stat = statSync(src);
  if (!stat.isFile()) continue;
  log(`[clean]  rm ${posix.relative(repo, src)}`);
  if (!dryRun) rmSync(src);
}

log(dryRun ? '\n(dry run; no files touched)' : '\nDone.');
