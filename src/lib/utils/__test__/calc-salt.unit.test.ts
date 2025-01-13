import calculateRandomSalt from '../calc-salt';

describe('calculate salt', () => {
  it('calculates a random salt', () => {
    const results = [
      calculateRandomSalt(),
      calculateRandomSalt(),
      calculateRandomSalt(),
      calculateRandomSalt(),
      calculateRandomSalt(),
      calculateRandomSalt(),
      calculateRandomSalt(),
      calculateRandomSalt(),
      calculateRandomSalt(),
      calculateRandomSalt(),
    ];

    const set = new Set(results);
    expect(set.size).toBe(results.length);
  });
});
