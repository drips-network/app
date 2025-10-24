/**
 * Generate a URL path string from a path and object of parameters.
 * @param path The URL path, which may contain placeholders like [param] and an existing query string.
 * @param params Params to add/overwrite/remove.
 * - `string` values overwrite/add query params or interpolate path params.
 * - `null` values remove query params.
 * @returns A full URL path string including the supplied query parameters.
 */
export default function buildUrl(path: string, params: Record<string, string | null>) {
  // 1. Separate the path from any existing query string
  const [pathname, existingSearch] = path.split('?');

  // 2. Parse the existing query string.
  const searchParams = new URLSearchParams(existingSearch);

  // 3. Copy params. We'll delete keys from this object
  //    if they are used for path interpolation.
  const queryParams = { ...params };
  let interpolatedPath = pathname;

  // 4. Interpolate path parameters
  for (const [param, value] of Object.entries(params)) {
    // Only attempt to interpolate if the value is a string
    if (typeof value === 'string') {
      const replaced = interpolatedPath.replace(`[${param}]`, value);
      if (replaced !== interpolatedPath) {
        interpolatedPath = replaced;
        // This param was used for interpolation, so don't apply it to the query string
        delete queryParams[param];
      }
    }
  }

  // 5. Add/overwrite/delete remaining params from the query string
  for (const [param, value] of Object.entries(queryParams)) {
    if (value === null) {
      // If value is null, delete the param from the search string
      searchParams.delete(param);
    } else {
      // It must be a string (since we didn't delete it). Set/overwrite it.
      searchParams.set(param, value);
    }
  }

  // 6. Convert the final params back to a string
  const search = searchParams.toString();

  // 7. Combine the interpolated path and the new search string
  return `${interpolatedPath}${search ? `?${search}` : ''}`;
}
