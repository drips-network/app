export default (
  input: number,
  rangeMin: number,
  rangeMax: number,
  newRangeMin: number,
  newRangeMax: number,
): number => {
  return ((input - rangeMin) * (newRangeMax - newRangeMin)) / (rangeMax - rangeMin) + newRangeMin;
};
