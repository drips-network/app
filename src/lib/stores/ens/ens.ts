import { isAddress, type AbstractProvider } from 'ethers';
import { NETWORK_CONFIG } from '../wallet/network';
import FailoverJsonRpcProvider from '$lib/utils/FailoverJsonRpcProvider';
import filterFalsy from '$lib/utils/filter-falsy';

async function isAddressContract(provider: AbstractProvider, address: string) {
  return (await provider.getCode(address)) !== '0x';
}

export function getMainnetProvider() {
  const mainnet = NETWORK_CONFIG[1];
  return new FailoverJsonRpcProvider(
    filterFalsy([mainnet.rpcUrl, mainnet.fallbackRpcUrl]),
    undefined,
    undefined,
    { logger: console },
  );
}

/**
 * Safely reverse lookup an ENS name, ensuring that the resolved address is safe to use.
 * Resolved addresses are considered unsafe if they are contracts on one chain but not the other.
 * @param currentChainProvider A provider for the current chain
 * @param mainnetProvider A provider connected to Ethereum Mainnet
 * @param chainId The chain ID of the current network
 * @param name The name to reverse-lookup
 * @returns resolved address if exists and safe, otherwise undefined
 */
export async function safeReverseLookup(
  currentChainProvider: AbstractProvider,
  mainnetProvider: AbstractProvider,
  chainId: number,
  name: string,
) {
  try {
    const resolver = await mainnetProvider.getResolver(name);
    if (!resolver) return undefined;

    const addressForCurrentChain = await resolver.getAddress(chainId);
    if (isAddress(addressForCurrentChain)) return addressForCurrentChain;

    const address = await resolver.getAddress();
    if (!address) return undefined;
    if (chainId === 1) return address;

    const [isContractOnMainnet, isContractOnCurrentChain] = await Promise.all([
      isAddressContract(mainnetProvider, address),
      isAddressContract(currentChainProvider, address),
    ]);

    return !isContractOnCurrentChain && isContractOnMainnet ? undefined : address;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failure to resolve ENS name:', error);
    return undefined;
  }
}
