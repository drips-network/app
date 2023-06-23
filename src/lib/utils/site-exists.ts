export default async function siteExists(url: string) {
  const res = await fetch(url);

  return res.status === 200;
}
