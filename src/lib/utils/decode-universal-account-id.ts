import ens from '$lib/stores/ens';
import { isAddress } from 'ethers';
import { executeAddressDriverReadMethod } from './sdk/address-driver/address-driver';
import type { OxString } from './sdk/sdk-types';
import { extractDriverNameFromAccountId } from './sdk/utils/extract-driver-from-accountId';
import extractAddressFromAccountId from './sdk/utils/extract-address-from-accountId';

interface AddressDriverResult {
  driver: 'address';
  address: string;
  dripsAccountId: string;
}

interface RepoDriverResult {
  driver: 'repo';
  dripsAccountId: string;
}

interface NFTDriverResult {
  driver: 'nft';
  dripsAccountId: string;
}

/**
 * "universalAccountIdentifier" is either an .ens name, an ETH address, or a Drips User ID (any supported driver).
 * This utility takes such an identifier (which e.g. may be navigated to via drips.network/<universalAcccountIdentifier>),
 * figures out which of the options it is, and returns an object describing the target.
 * @param universalAcccountIdentifier
 */
export default async function (
  universalAcccountIdentifier: string,
): Promise<AddressDriverResult | RepoDriverResult | NFTDriverResult> {
  if (isAddress(universalAcccountIdentifier)) {
    const address = universalAcccountIdentifier;
    const dripsAccountId = (
      await executeAddressDriverReadMethod({
        functionName: 'calcAccountId',
        args: [universalAcccountIdentifier as OxString],
      })
    ).toString();

    return {
      driver: 'address',
      address,
      dripsAccountId,
    };
  } else if ((universalAcccountIdentifier as string).endsWith('.eth')) {
    // Subscribe to ens.connected store and wait until it's true
    const lookup = await ens.reverseLookup(universalAcccountIdentifier);
    if (lookup) {
      const dripsAccountId = (
        await executeAddressDriverReadMethod({
          functionName: 'calcAccountId',
          args: [lookup as OxString],
        })
      ).toString();
      const address = lookup;

      return {
        driver: 'address',
        address,
        dripsAccountId,
      };
    } else {
      throw new Error('Not found');
    }
  } else if (/^\d+$/.test(universalAcccountIdentifier)) {
    // User ID param has only numbers and is probably a drips user ID
    const dripsAccountId = universalAcccountIdentifier;

    const driver = extractDriverNameFromAccountId(dripsAccountId);

    if (driver === 'address') {
      const address = extractAddressFromAccountId(universalAcccountIdentifier);

      return {
        driver: 'address',
        address,
        dripsAccountId,
      };
    } else {
      if (driver === 'immutableSplits') {
        throw new Error('Unsupported Driver');
      }

      return {
        driver,
        dripsAccountId,
      };
    }
  } else {
    throw new Error('Not found.');
  }
}
