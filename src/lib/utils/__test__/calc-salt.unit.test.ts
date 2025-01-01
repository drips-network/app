import calculateSaltFromAddress from '../calc-salt';

describe('calculate salt', () => {
  it('calculates a random salt', () => {
    const SEED_CONSTANT = 'test';
    const address = '0xe2E9b9B5d0757c26aB477A754788B19b60f2ed83';

    const results = [
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
      calculateSaltFromAddress(SEED_CONSTANT, address),
    ];

    const set = new Set(results);
    expect(set.size).toBe(results.length);
  });
});
