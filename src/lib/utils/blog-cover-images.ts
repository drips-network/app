/**
 * Pre-rendered blog cover image variants, served by `/api/blog-images/[variant]/[slug].jpg`.
 * All variants for all posts are statically generated at build time, so adding a variant
 * here is all that's needed to make it available.
 *
 * Variants are center-cropped from the (wider) source images to a 10:7 aspect.
 */
export const BLOG_COVER_IMAGE_VARIANTS = {
  card: { width: 1200, height: 840 },
  compact: { width: 720, height: 504 },
} as const;

export type BlogCoverImageVariant = keyof typeof BLOG_COVER_IMAGE_VARIANTS;

export function blogCoverImageUrl(slug: string, variant: BlogCoverImageVariant): string {
  return `/api/blog-images/${variant}/${slug}.jpg`;
}
