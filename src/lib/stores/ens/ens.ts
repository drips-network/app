import { type AbstractProvider } from 'ethers';
import { NETWORK_CONFIG } from '../wallet/network';
import { JsonRpcProvider } from 'ethers';

async function isAddressContract(provider: AbstractProvider, address: string) {
  return (await provider.getCode(address)) !== '0x';
}

export function getMainnetProvider() {
  const mainnet = NETWORK_CONFIG[1];
  return new JsonRpcProvider(mainnet.rpcUrl);
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

    // coinType 60 is Ethereum Mainnet, but we can use chainIds for all other supported chains
    // See https://github.com/ethers-io/ethers.js/discussions/4964
    const addressForCurrentChain = await resolver.getAddress(chainId === 1 ? 60 : chainId);
    if (addressForCurrentChain || chainId === 1) return addressForCurrentChain ?? undefined;

    const address = await resolver.getAddress(60);
    if (!address) return undefined;

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
