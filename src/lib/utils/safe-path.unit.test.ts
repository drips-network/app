import isSafePath, { safeParseBackToParam } from './safe-path';

describe('isSafePath', () => {
  it.each([
    '/',
    '/wave',
    '/wave/issues?x=1#y',
    '/app/drip-lists/123',
    '/wave/kyc-required?backTo=%2Fwave%2Frewards',
    '/wave/login?backTo=/wave/kyc&skipWelcome=true',
  ])('accepts in-app path %j', (input) => {
    expect(isSafePath(input)).toBe(true);
  });

  it.each([
    '',
    'wave/issues',
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'https://evil.com',
    'HTTPS://evil.com',
    '//evil.com',
    '///evil.com',
    '/\\evil.com',
    '\\\\evil.com',
    '\\/evil.com',
    ' /wave',
    '\t/wave',
    '/\t/evil.com',
    '/\n/evil.com',
    '/wave\r\nSet-Cookie: x=y',
  ])('rejects %j', (input) => {
    expect(isSafePath(input)).toBe(false);
  });
});

describe('safeParseBackToParam', () => {
  const parse = (search: string) =>
    safeParseBackToParam(new URL(`https://drips.network/x${search}`));

  it('returns a valid backTo as-is', () => {
    expect(parse(`?backTo=${encodeURIComponent('/wave/issues?x=1&y=2#z')}`)).toBe(
      '/wave/issues?x=1&y=2#z',
    );
  });

  it('returns an empty string if backTo is missing', () => {
    expect(parse('')).toBe('');
  });

  it('rejects unsafe values', () => {
    expect(parse(`?backTo=${encodeURIComponent('JavaScript:alert(1)')}`)).toBe('');
    expect(parse(`?backTo=${encodeURIComponent('/\\evil.com')}`)).toBe('');
    expect(parse('?backTo=%2F%2Fevil.com')).toBe('');
  });

  it('does not decode the value a second time', () => {
    expect(parse('?backTo=%252F%252Fevil.com')).toBe('');
    expect(parse('?backTo=%2Fwave%2F%2525')).toBe('/wave/%25');
  });

  it('does not throw on a stray percent sign', () => {
    expect(() => parse('?backTo=%2Fwave%2F100%25')).not.toThrow();
    expect(parse('?backTo=%2Fwave%2F100%25')).toBe('/wave/100%');
  });
});
