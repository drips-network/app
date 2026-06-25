/**
 * Takes a `href` and builds a link to the `/external/` route, which
 * warns the user before sending them off to the external page.
 * @param href The href to build the link to.
 * @returns A link to `/external/` route, warning the user before
 * sending them off to the external page. If `href` is not a valid
 * absolute URL (e.g. a relative link coming from user-authored markdown
 * such as a GitHub issue body), it is returned unchanged — there is no
 * external destination to guard, and `new URL()` would otherwise throw
 * `TypeError: Invalid URL` and crash server-side rendering.
 */
export default function (href: string) {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }
  const encoded = encodeURIComponent(url.href);

  return `/external/${encoded}`;
}
