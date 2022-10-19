export interface FailedExpectation {
  failed: true;
}

/**
 * Function `func` will be called every `checkingEvery` milliseconds, up to `within`
 * milliseconds total. Every time, its returned value is compared with `toMatchCondition`.
 * If it's a match, returns the return value of `func`. If after all tries are exceeded
 * the condition still doesn't match, a `FailedExpectation` is returned.
 * @param func The function to execute every `checkingEvery` for `within` millis total.
 * @param toMatchCondition The comparator function to run against `func`'s return value
 * on every try.
 * @param within How many milliseconds we should keep on trying for. Keep in mind that
 * if `func` is a slow-resolving promise, we may end up waiting for a bit longer than
 * this value.
 * @param checkingEvery How much time we should wait between each attempt.
 * @returns Return type of `func` matching `toMatchCondition`, or a `FailedExpectation`
 * if it never did.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function expect<T extends (() => any) | (() => Promise<any>)>(
  func: T,
  toMatchCondition: (result: Awaited<ReturnType<T>>) => boolean,
  within = 5000,
  checkingEvery = 1000,
): Promise<ReturnType<T> | FailedExpectation> {
  const numberOfChecks = within / checkingEvery;

  const checks = Array.from(Array(numberOfChecks).keys()).map(() => func);

  for (const check of checks) {
    const result = await check();

    if (toMatchCondition(result)) {
      return result;
    }

    await new Promise((r) => setTimeout(r, checkingEvery));
  }

  return {
    failed: true,
  };
}
