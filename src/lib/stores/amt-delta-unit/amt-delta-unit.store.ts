import storedWritable from '$lib/utils/stored-writable';
import { z } from 'zod';

const schema = z.union([
  z.literal('sec'),
  z.literal('min'),
  z.literal('day'),
  z.literal('30-days'),
  z.literal('365-days'),
]);
type AmtDeltaUnit = z.infer<typeof schema>;

export const MULTIPLIERS: { [key in AmtDeltaUnit]: number } = {
  sec: 1,
  min: 60,
  day: 86400,
  '30-days': 2592000,
  '365-days': 31536000,
};

export const FRIENDLY_NAMES: { [key in AmtDeltaUnit]: string } = {
  sec: 'sec',
  min: 'min',
  day: 'day',
  '30-days': 'month',
  '365-days': 'year',
};

export default (() => {
  const state = storedWritable('amt-delta-unit', schema, 'sec');

  function set(unit: AmtDeltaUnit) {
    state.set(unit);
  }

  return {
    subscribe: state.subscribe,
    set,
  };
})();
