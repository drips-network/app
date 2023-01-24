import expectUtil from '../expect';

describe('expect.ts', () => {
  it('calls the func the expected number of times', async () => {
    const mockFn = vi.fn(() => 1);

    await expectUtil(mockFn, (r) => r === 2, 500, 100);

    expect(mockFn).toHaveBeenCalledTimes(5);
    mockFn.mockClear();

    await expectUtil(mockFn, (r) => r === 2, 400, 50);

    expect(mockFn).toHaveBeenCalledTimes(8);
    mockFn.mockClear();

    await expectUtil(mockFn, (r) => r === 2, 634, 23);
    expect(mockFn).toHaveBeenCalledTimes(27);
  });

  it('resolves when the function returns the expected value', async () => {
    let checkedTimes = 0;
    const mockFn = vi.fn(() => {
      if (checkedTimes === 3) return true;
      checkedTimes++;
      return false;
    });

    const res = await expectUtil(mockFn, (r) => r, 500, 100);

    expect(mockFn).toHaveBeenCalledTimes(4);
    expect(res).toStrictEqual({ failed: false, result: true });
  });

  it('returns a FailedExpectation if the function resolves only after the max time', async () => {
    let checkedTimes = 0;
    const mockFn = vi.fn(() => {
      if (checkedTimes === 6) return true;
      checkedTimes++;
      return false;
    });

    const res = await expectUtil(mockFn, (r) => r, 500, 100);

    expect(mockFn).toHaveBeenCalledTimes(5);
    expect(res).toStrictEqual({ failed: true });
  });
});

export {};
