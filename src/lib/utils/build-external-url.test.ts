import { describe, it, expect } from 'vitest';
import buildExternalUrl from './build-external-url';

describe('buildExternalUrl', () => {
  it('wraps a valid absolute URL in the /external/ route', () => {
    expect(buildExternalUrl('https://example.com/x')).toBe(
      `/external/${encodeURIComponent('https://example.com/x')}`,
    );
  });

  it('returns a non-absolute href unchanged instead of throwing', () => {
    // Relative links reach this fn via user-authored markdown (e.g. issue bodies).
    // `new URL()` would throw TypeError: Invalid URL and crash SSR.
    expect(() => buildExternalUrl('README.md')).not.toThrow();
    expect(buildExternalUrl('README.md')).toBe('README.md');
    expect(buildExternalUrl('/contributing')).toBe('/contributing');
  });
});
