export default (percentage: number, newRangeMin: number, newRangeMax: number): number => {
  return newRangeMin + (percentage / 100) * (newRangeMax - newRangeMin);
}
