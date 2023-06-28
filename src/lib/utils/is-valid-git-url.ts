export default function isValidGitUrl(url: string): boolean {
  try {
    const parsedURL = new URL(url);

    if (parsedURL.hostname !== 'github.com') {
      return false;
    }

    const pathname = parsedURL.pathname;
    if (!pathname.startsWith('/') || pathname.split('/').length < 3) {
      return false;
    }

    const name = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const nameSegments = name.split('/');
    if (nameSegments.length !== 2 || !nameSegments[0] || !nameSegments[1]) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}
