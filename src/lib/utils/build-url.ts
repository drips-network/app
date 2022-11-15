/**
 * Genereate a URL path string from a path and object of parameters.
 * @param path The URL path.
 * @param params Query params to add to the URL.
 * @returns A full URL path string including the supplied query parameters.
 */
export default function buildUrl(path: string, params: Record<string, string>) {
  const query = { ...params };
  let interpolatedPath = path;
  for (const [param, value] of Object.entries(params)) {
    const replaced = interpolatedPath.replace(`[${param}]`, value);
    if (replaced !== interpolatedPath) {
      interpolatedPath = replaced;
      delete query[param];
    }
  }
  const search = new URLSearchParams(query).toString();
  return `${interpolatedPath}${search ? `?${search}` : ''}`;
}
