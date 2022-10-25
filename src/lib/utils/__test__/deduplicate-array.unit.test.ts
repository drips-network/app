import deduplicateArray from '../deduplicate-array';

describe('deduplicate-array.ts', () => {
  it('deduplicates based on key value', () => {
    const input = [{ id: 'foo', hey: 'ho' }, { id: 'foo' }, { id: 'bar' }];

    const result = deduplicateArray(input, 'id');

    expect(result[0].id).toBe('foo');
    expect(result[1].id).toBe('bar');
    expect(result[2]).toBe(undefined);
  });
});
