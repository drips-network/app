import { describe, expect, it } from 'vitest';
import { getPointsForComplexity } from './get-points-for-complexity';

describe('getPointsForComplexity', () => {
  it('returns 0 points for small complexity', () => {
    expect(getPointsForComplexity('small')).toBe(0);
  });

  it('returns 50 points for medium complexity', () => {
    expect(getPointsForComplexity('medium')).toBe(50);
  });

  it('returns 100 points for large complexity', () => {
    expect(getPointsForComplexity('large')).toBe(100);
  });
});
