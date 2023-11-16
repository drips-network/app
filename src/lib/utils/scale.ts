export default function scale(input: number, r1: [number, number], r2: [number, number]) {
  return ((input - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
}
