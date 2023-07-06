import type { StreamsSetEvent } from 'radicle-drips';

export default <T extends StreamsSetEvent>(streamsSetEvents: T[]): T[] =>
  streamsSetEvents.sort((a, b) => Number(a.blockTimestamp) - Number(b.blockTimestamp));
