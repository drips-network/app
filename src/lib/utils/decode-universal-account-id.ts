import ens from '$lib/stores/ens';
import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
import { isAddress } from 'ethers/lib/utils';
import { AddressDriverClient, Utils } from 'radicle-drips';
import { get } from 'svelte/store';

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
 * "universalAcccountIdentifier" is either an .ens name, an ETH address, or a Drips User ID (any supported driver).
 * This utility takes such an identifier (which e.g. may be navigated to via drips.network/<universalAcccountIdentifier>),
 * figures out which of the options it is, and returns an object describing the target.
 * @param universalAcccountIdentifier
 */
export default async function (
  universalAcccountIdentifier: string,
): Promise<AddressDriverResult | RepoDriverResult | NFTDriverResult> {
  if (isAddress(universalAcccountIdentifier)) {
    const address = universalAcccountIdentifier;
    const dripsAccountId = await (
      await getAddressDriverClient()
    ).getAccountIdByAddress(universalAcccountIdentifier);

    return {
      driver: 'address',
      address,
      dripsAccountId,
    };
  } else if (universalAcccountIdentifier.endsWith('.eth')) {
    // Subscribe to ens.connected store and wait until it's true

    const ensConnected = ens.connected;

    if (!get(ensConnected)) {
      await new Promise((resolve) => {
        const unsubscribe = ensConnected.subscribe((connected) => {
          if (connected) {
            unsubscribe();
            resolve(undefined);
          }
        });
      });
    }

    const lookup = await ens.reverseLookup(universalAcccountIdentifier);
    if (lookup) {
      const dripsAccountId = await (await getAddressDriverClient()).getAccountIdByAddress(lookup);
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

    const driver = Utils.AccountId.getDriver(dripsAccountId);

    if (driver === 'address') {
      const address = AddressDriverClient.getUserAddress(universalAcccountIdentifier);

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
