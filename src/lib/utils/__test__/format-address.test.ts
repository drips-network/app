import formatAddress from '../format-address';

describe('formatAddress', () => {
  it('should format a valid Ethereum address', () => {
    const input = '0x1234567890abcdef1234567890abcdef12345678';
    const expectedOutput = '0x12–5678';
    expect(formatAddress(input)).toBe(expectedOutput);
  });

  it('should handle addresses shorter than 8 characters', () => {
    const input = '0x1234';
    const expectedOutput = '0x12–1234';
    expect(formatAddress(input)).toBe(expectedOutput);
  });

  it('should handle exactly 8 characters', () => {
    const input = '0xabcdefgh';
    const expectedOutput = '0xab–efgh';
    expect(formatAddress(input)).toBe(expectedOutput);
  });

  it('should handle empty strings', () => {
    const input = '';
    const expectedOutput = '–';
    expect(formatAddress(input)).toBe(expectedOutput);
  });

  it('should handle addresses with less than 4 characters', () => {
    const input = '0xabc';
    const expectedOutput = '0xab–xabc';
    expect(formatAddress(input)).toBe(expectedOutput);
  });
});
