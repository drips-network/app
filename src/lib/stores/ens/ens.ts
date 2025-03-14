import type { AbstractProvider } from 'ethers';
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
export async function safeReverseLookp(
  currentChainProvider: AbstractProvider,
  mainnetProvider: AbstractProvider,
  chainId: number,
  name: string,
) {
  if (chainId === 1) {
    return await mainnetProvider.resolveName(name);
  }

  const address = await mainnetProvider.resolveName(name);
  if (!address) return undefined;

  const resolver = await mainnetProvider.getResolver(name);
  if (!resolver) return undefined;

  const addressForCurrentChain = await resolver.getAddress(chainId);
  if (addressForCurrentChain) return addressForCurrentChain;

  const [tempAddressIsContractOnMainnet, tempAddressIsContractOnCurrentChain] = await Promise.all([
    isAddressContract(mainnetProvider, address),
    isAddressContract(currentChainProvider, address),
  ]);

  // If the address is a contract on both chains, we can assume resolving mainnet address is safe.
  // If it's not one on either, we're also good.
  // If it's a contract on one chain but not the other, we can't be sure whether it's safe to send
  // to the mainnet-resolved address on the current chain.
  if (tempAddressIsContractOnMainnet && tempAddressIsContractOnCurrentChain) {
    return address;
  } else if (!tempAddressIsContractOnMainnet && !tempAddressIsContractOnCurrentChain) {
    return address;
  } else {
    return undefined;
  }
}
