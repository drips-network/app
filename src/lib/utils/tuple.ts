/**
 * Creates a strongly-typed tuple from any number of arguments.
 * @param args List of tuple members.
 * @returns An strongly-typed tuple array containing the provided members.
 */
export default function tuple<T extends unknown[]>(...args: T) {
  return args;
}
