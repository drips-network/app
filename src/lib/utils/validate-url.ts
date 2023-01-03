/**
 * Checks whether `input` is a valid `https` or `http` URL.
 * @param input The string to check.
 * @returns True if the validation succeeded, false if not.
 */
export default function (input: string) {
  let url;
  try {
    url = new URL(input);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}
