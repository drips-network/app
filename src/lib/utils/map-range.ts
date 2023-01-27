// Credit to https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56

function clamp(input: number, min: number, max: number): number {
  return input < min ? min : input > max ? max : input;
}

/**
 * Maps number `current` in range `in_min` to `in_max` to a range between `out_min` and `out_max`.
 * @param current The number in range A to map over range B.
 * @param in_min Range min.
 * @param in_max Range max.
 * @param out_min Target range min.
 * @param out_max Target range max.
 * @returns Number `current` mapped over target range.
 */
export default function map(
  current: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number,
): number {
  const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return clamp(mapped, out_min, out_max);
}
