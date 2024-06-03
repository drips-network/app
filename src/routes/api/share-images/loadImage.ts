export default async function (
  path: string,
  fetch: typeof window.fetch,
  prefix = 'data:image/png;base64,',
) {
  const res = await fetch(path);
  const buffer = await res.arrayBuffer();

  const base64 = Buffer.from(buffer).toString('base64');

  return prefix + base64;
}
