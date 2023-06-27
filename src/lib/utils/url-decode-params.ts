export default function uriDecodeParams<T extends Record<string, string>>(params: T): T {
  return Object.fromEntries(
    Object.entries(params).map(([key, val]) => [key, decodeURIComponent(val)]),
  ) as T;
}
