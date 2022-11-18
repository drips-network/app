import ens from '$lib/stores/ens';
import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
import { isAddress } from 'ethers/lib/utils';
import { AddressDriverClient } from 'radicle-drips';

export default async function (userId: string): Promise<{
  address: string;
  dripsUserId: string;
}> {
  if (isAddress(userId)) {
    const address = userId;
    const dripsUserId = await (await getAddressDriverClient()).getUserIdByAddress(userId);

    return {
      address,
      dripsUserId,
    };
  } else if (/^\d+$/.test(userId)) {
    // User ID param has only numbers and is probably a drips user ID
    const dripsUserId = userId;
    const address = AddressDriverClient.getUserAddress(userId);

    return {
      address,
      dripsUserId,
    };
  } else if (userId.endsWith('.eth')) {
    const lookup = await ens.reverseLookup(userId);
    if (lookup) {
      const dripsUserId = await (await getAddressDriverClient()).getUserIdByAddress(lookup);
      const address = lookup;

      return {
        address,
        dripsUserId,
      };
    } else {
      throw new Error('Not found');
    }
  } else {
    throw new Error('Not found.');
  }
}
