/**
 * @param f
 * @returns A memoized version of the function, using the first argument as the key.
 */
export function memoize<I extends unknown[], O>(
  f: (...values: I) => O,
): (...values: I) => O {
  const cache: Map<I[0], O> = new Map();

  return (...values: I): O => {
    if (!cache.has(values[0])) {
      cache.set(values[0], f(...values));
    }

    return cache.get(values[0])!;
  };
}
