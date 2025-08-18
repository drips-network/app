import isValidOrcidId from './is-orcid-id';

describe('is-orcid.ts', () => {
  it('returns false for non-string input', () => {
    expect(isValidOrcidId(5 as unknown as string)).toBe(false);
  });

  it('returns false invalid formats', () => {
    expect(isValidOrcidId('Hello World')).toBe(false);
  });

  it('returns false for incorrect X position', () => {
    expect(isValidOrcidId('0000-0001-5109-370X')).toBe(false);
  });

  it('returns false for incorrect checksums', () => {
    expect(isValidOrcidId('0000-0002-1825-0098')).toBe(false);
  });

  it('returns true for valid ORCIDs', () => {
    expect(isValidOrcidId('0000-0002-1825-0097')).toBe(true);
    expect(isValidOrcidId('0000-0002-9079-593X')).toBe(true);
  });
});
