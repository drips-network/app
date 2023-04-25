/**
 * Takes a `href` and builds a link to the `/external/` route, which
 * warns the user before sending them off to the external page.
 * @param href The href to build the link to.
 * @returns A link to `/external/` route, warning the user before
 * sending them off to the external page.
 */
export default function (href: string) {
  const url = new URL(href);
  const encoded = encodeURIComponent(url.href);

  return `/external/${encoded}`;
}
