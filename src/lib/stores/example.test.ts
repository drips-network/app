import { get } from 'svelte/store';
import test from './example';

it('increments', () => {
  test.increment(1);

  expect(get(test)).toBe(1);
});
