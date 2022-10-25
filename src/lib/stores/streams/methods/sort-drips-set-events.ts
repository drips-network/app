import type { DripsSetEvent } from 'radicle-drips';

export default <T extends DripsSetEvent>(dripsSetEvents: T[]): T[] =>
  dripsSetEvents.sort((a, b) => Number(a.blockTimestamp) - Number(b.blockTimestamp));
