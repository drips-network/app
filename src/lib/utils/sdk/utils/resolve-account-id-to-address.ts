import { isAddress, type JsonRpcProvider } from 'ethers';
import extractAddressFromAccountId from './extract-address-from-accountId';
import { extractDriverNameFromAccountId } from './extract-driver-from-accountId';
import { safeReverseLookup } from '$lib/stores/ens/ens';

export type ResolutionResult =
  | { type: 'success'; address: string; resolvedEnsName?: string | null }
  | { type: 'ens-not-resolved' }
  | {
      type: 'driver-account';
      driver: 'nft' | 'repo' | 'immutableSplits' | 'repoSubAccountDriver';
      accountId: string;
    }
  | { type: 'not-found' };

export async function resolveAccountIdToAddress(
  universalAccountId: string,
  currentNetworkProvider: JsonRpcProvider,
  mainnetProvider: JsonRpcProvider | null,
  chainId: number,
): Promise<ResolutionResult> {
  let address: string;

  if (isAddress(universalAccountId)) {
    address = universalAccountId;
  } else if ((universalAccountId as string).endsWith('.eth')) {
    if (!mainnetProvider) {
      return { type: 'ens-not-resolved' };
    }

    const lookupRes = await safeReverseLookup(
      currentNetworkProvider,
      mainnetProvider,
      chainId,
      universalAccountId,
    );

    if (!lookupRes) {
      return { type: 'ens-not-resolved' };
    }

    address = lookupRes;
    // We already resolved the name, so we can return it.
    // However, the original code looked up the ENS name of the address *separately* sometimes.
    // For .eth input, the input IS the ENS name (mostly).
    // Let's pass it back as resolvedEnsName so the caller knows.
    return { type: 'success', address, resolvedEnsName: universalAccountId };
  } else if (/^\d+$/.test(universalAccountId)) {
    const driver = extractDriverNameFromAccountId(universalAccountId);

    switch (driver) {
      case 'address': {
        address = extractAddressFromAccountId(universalAccountId);
        break;
      }
      case 'nft':
      case 'repo':
      case 'immutableSplits':
      case 'repoSubAccountDriver': {
        return { type: 'driver-account', driver, accountId: universalAccountId };
      }
      default: {
        return { type: 'not-found' };
      }
    }
  } else {
    return { type: 'not-found' };
  }

  return { type: 'success', address };
}
