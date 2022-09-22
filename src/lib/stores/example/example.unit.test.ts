import { get } from 'svelte/store';
import test from './example.store';

it.skip('increments', () => {
  test.increment(1);

  expect(get(test)).toBe(1);
});
