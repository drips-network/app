import { get } from 'svelte/store';
import { addressDriverRead } from '../address-driver/address-driver';
import type { OxString } from '../sdk-types';
import unreachable from '$lib/utils/unreachable';
import wallet from '$lib/stores/wallet/wallet.store';

export default async function getOwnAccountId() {
  const { signer } = get(wallet);
  assert(signer, `'getOwnAccountId' requires a signer but it's missing.`);

  return (
    await addressDriverRead({
      functionName: 'calcAccountId',
      args: [(signer.address as OxString) || unreachable()],
    })
  ).toString();
}
