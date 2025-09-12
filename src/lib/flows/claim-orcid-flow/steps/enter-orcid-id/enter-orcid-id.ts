import type { State } from '../../claim-orcid-flow';
import { get, type Writable } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';
import { fetchOrcid } from '../../../../utils/orcids/fetch-orcid';

// TODO: load orcid info
export async function loadFundingInfo(context: Writable<State>): Promise<void> {
  const $walletStore = get(walletStore);
  const address = $walletStore.address ?? '';
  const network = $walletStore.network.name
    ? $walletStore.network.name === 'homestead'
      ? 'ethereum'
      : $walletStore.network.name
    : '';

  // We can't make a useful FUNDING.json without an address or network.
  if (!address || !network) {
    return;
  }

  const $context = get(context);
  const orcidInfo = await fetchOrcid($context.claimableId, fetch)
  // TODO: handle, this is bad
  if (!orcidInfo) {
    throw new Error('ORCID not found');
  }

  context.update((c) => {
    c.claimableProof = orcidInfo.claimingUrl;
    return c;
  });
}
