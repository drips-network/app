export default function getCookieClientSide(cookieName: string): string | undefined {
  return document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${cookieName}=`))
    ?.replace(`${cookieName}=`, '');
}
