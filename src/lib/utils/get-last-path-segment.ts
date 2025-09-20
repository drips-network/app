export default function getLastPathSegment(url: string): string | undefined {
  try {
    // 1. Create a URL object
    const urlObject = new URL(url);

    // 2. Get the pathname, remove an optional trailing slash, and split by '/'
    const pathSegments = urlObject.pathname.replace(/\/$/, "").split('/');

    // 3. Get the last segment
    return pathSegments.pop();
  } catch (error) {
    console.error("Invalid URL:", error);
    return undefined;
  }
}