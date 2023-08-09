import isTest from './is-test';

export default async function siteExists(url: string) {
  if (isTest()) return true;

  const res = await fetch(url);

  return res.status === 200;
}
