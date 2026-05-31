import { describe, expect, it } from 'vitest';
import { paginationSchema, toPaginationParams } from './pagination';

describe('toPaginationParams', () => {
  it('returns an empty string when no input is given', () => {
    expect(toPaginationParams()).toBe('');
    expect(toPaginationParams(undefined)).toBe('');
  });

  it('serializes page and limit', () => {
    expect(toPaginationParams({ page: 2, limit: 10 })).toBe('page=2&limit=10');
  });

  it('serializes a cursor (limit before cursor)', () => {
    expect(toPaginationParams({ cursor: 'abc123', limit: 10 })).toBe('limit=10&cursor=abc123');
  });

  it('url-encodes the cursor value', () => {
    expect(toPaginationParams({ cursor: 'a b/c=' })).toBe('cursor=a+b%2Fc%3D');
  });
});

describe('paginationSchema', () => {
  const base = {
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  it('accepts a response without nextCursor (offset mode)', () => {
    expect(paginationSchema.parse(base).nextCursor).toBeUndefined();
  });

  it('accepts a string nextCursor', () => {
    expect(paginationSchema.parse({ ...base, nextCursor: 'abc' }).nextCursor).toBe('abc');
  });

  it('accepts a null nextCursor (last page)', () => {
    expect(paginationSchema.parse({ ...base, nextCursor: null }).nextCursor).toBeNull();
  });
});
