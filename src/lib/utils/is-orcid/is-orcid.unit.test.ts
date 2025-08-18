import isValidOrcid from './is-orcid';

describe('is-orcid.ts', () => {
  it('returns false for non-string input', () => {
    expect(isValidOrcid(5 as unknown as string)).toBe(false);
  });

  it('returns false invalid formats', () => {
    expect(isValidOrcid('Hello World')).toBe(false);
  });

  it('returns false for incorrect X position', () => {
    expect(isValidOrcid('0000-0001-5109-370X')).toBe(false);
  });

  it('returns false for incorrect checksums', () => {
    expect(isValidOrcid('0000-0002-1825-0098')).toBe(false);
  });

  it('returns true for valid ORCIDs', () => {
    expect(isValidOrcid('0000-0002-1825-0097')).toBe(true);
    expect(isValidOrcid('0000-0002-9079-593X')).toBe(true);
  });
});
