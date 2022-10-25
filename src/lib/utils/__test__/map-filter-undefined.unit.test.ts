import mapFilterUndefined from '../map-filter-undefined';

describe('map-filter-undefined.ts', () => {
  it('maps and filters undefined values from the result', () => {
    const input = [{ hey: 'ho' }, { hey: 'ho' }, { hey: 'no' }];

    const result = mapFilterUndefined(input, (v) => {
      if (v.hey === 'ho') {
        return 'nice';
      } else {
        return undefined;
      }
    });

    expect(result).toStrictEqual(['nice', 'nice']);
  });
});

export {};
