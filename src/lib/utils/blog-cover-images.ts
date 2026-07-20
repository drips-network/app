/**
 * Pre-rendered blog cover image variants, served by `/api/blog-images/[variant]/[slug].jpg`.
 * All variants for all posts are statically generated at build time, so adding a variant
 * here is all that's needed to make it available.
 *
 * Aspect ratio matches the ~2.34:1 of our cover image sources, so the `first` post card
 * (which displays the image at its intrinsic aspect) looks the same as before.
 */
export const BLOG_COVER_IMAGE_VARIANTS = {
  card: { width: 1200, height: 512 },
  compact: { width: 720, height: 308 },
} as const;

export type BlogCoverImageVariant = keyof typeof BLOG_COVER_IMAGE_VARIANTS;

export function blogCoverImageUrl(slug: string, variant: BlogCoverImageVariant): string {
  return `/api/blog-images/${variant}/${slug}.jpg`;
}
