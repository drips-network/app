import network from '$lib/stores/wallet/network';
import unreachable from './unreachable';

export default function filterCurrentChainData<T extends { chain: string }>(items: T[]): T {
  const filteredItems = items.filter((item) => item.chain === network.gqlName);
  return filteredItems.length > 0 ? filteredItems[0] : unreachable();
}
