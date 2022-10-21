import type { DripsSetEvent } from 'radicle-drips';

export default <T extends DripsSetEvent>(dripsSetEvents: T[]): T[] =>
  dripsSetEvents.sort((a, b) => (a.blockTimestamp > b.blockTimestamp ? 1 : -1));
