import formatDate from '../format-date';

describe('formatDate', () => {
  const date = new Date('2024-09-24T12:30:00');

  it('should format date using onlyDay convention', () => {
    const expectedOutput = 'September 24th';
    expect(formatDate(date, 'onlyDay')).toBe(expectedOutput);
  });

  it('should format date using dayAndYear convention', () => {
    const expectedOutput = 'September 24, 2024';
    expect(formatDate(date, 'dayAndYear')).toBe(expectedOutput);
  });

  it('should format date using standard convention', () => {
    const expectedOutput = 'Sep 24, 2024, 12:30 PM';
    expect(formatDate(date, 'standard')).toBe(expectedOutput);
  });

  it('should format date using verbose convention', () => {
    const expectedOutput = 'September 24, 2024 at 12:30 PM';
    expect(formatDate(date, 'verbose')).toBe(expectedOutput);
  });

  it('should default to standard convention if no convention is provided', () => {
    const expectedOutput = 'Sep 24, 2024, 12:30 PM';
    expect(formatDate(date)).toBe(expectedOutput);
  });

  it('should throw a TypeError with message "Invalid time value" for an invalid date string', () => {
    const invalidDate = new Date('invalid-date-string');
    expect(() => formatDate(invalidDate, 'standard')).toThrow('Invalid time value');
  });
});
