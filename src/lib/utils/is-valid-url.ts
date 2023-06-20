export default function isValidUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}
