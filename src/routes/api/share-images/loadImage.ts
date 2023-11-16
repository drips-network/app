export default async function (path: string, fetch: typeof window.fetch) {
  const res = await fetch(path);
  const buffer = await res.arrayBuffer();

  const base64 = Buffer.from(buffer).toString('base64');

  return 'data:image/png;base64,' + base64;
}
