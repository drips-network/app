export default async function (path: string, fetch: typeof window.fetch) {
  const res = await fetch(path);
  return res.arrayBuffer();
}
