function validateUrl(url: string, allowedHosts: string[]): boolean {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // if url ends with /, remove it
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    const parsedURL = new URL(url);

    if (!allowedHosts.includes(parsedURL.hostname)) {
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
  } catch {
    return false;
  }
}

export function isSupportedGitUrl(url: string): boolean {
  const githubUrlRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;

  if (!githubUrlRegex.test(url)) {
    return false;
  }

  return validateUrl(url, ['github.com']);
}
