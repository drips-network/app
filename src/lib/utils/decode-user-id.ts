import ens from '$lib/stores/ens';
import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
import { isAddress } from 'ethers/lib/utils';
import { AddressDriverClient } from 'radicle-drips';

export default async function (accountId: string): Promise<{
  address: string;
  dripsAccountId: string;
}> {
  if (isAddress(accountId)) {
    const address = accountId;
    const dripsAccountId = await (await getAddressDriverClient()).getAccountIdByAddress(accountId);

    return {
      address,
      dripsAccountId,
    };
  } else if (/^\d+$/.test(accountId)) {
    // User ID param has only numbers and is probably a drips user ID
    const dripsAccountId = accountId;
    const address = AddressDriverClient.getUserAddress(accountId);

    return {
      address,
      dripsAccountId,
    };
  } else if (accountId.endsWith('.eth')) {
    const lookup = await ens.reverseLookup(accountId);
    if (lookup) {
      const dripsAccountId = await (await getAddressDriverClient()).getAccountIdByAddress(lookup);
      const address = lookup;

      return {
        address,
        dripsAccountId,
      };
    } else {
      throw new Error('Not found');
    }
  } else {
    throw new Error('Not found.');
  }
}
