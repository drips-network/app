import assert from '$lib/utils/assert';

export default function assert0xString(value: unknown): asserts value is `0x${string}` {
  assert(typeof value === 'string' && value.startsWith('0x'), 'Expected a 0x-prefixed string');
}
