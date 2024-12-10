import type { State } from '../../claim-project-flow';
import unreachable from '$lib/utils/unreachable';
import { getChangedTemplate } from '../add-ethereum-address/drips-json-template';
import type GitHub from '$lib/utils/github/GitHub';
import { get, type Writable } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';

export async function loadingFundingInfo(context: Writable<State>, github: GitHub): Promise<void> {
  const $walletStore = get(walletStore);
  const address = $walletStore.address ?? '';
  const network = $walletStore.network.name
    ? $walletStore.network.name === 'homestead'
      ? 'ethereum'
      : $walletStore.network.name
    : '';

  if (!address || !network) {
    return;
  }

  let fundingObject = {};
  try {
    const $context = get(context);
    const { ownerName, repoName } = $context.project?.source ?? unreachable();
    fundingObject = await github.fetchFundingJson(ownerName, repoName);
  } catch (error) {
    if (!(error as Error).message.includes('not found')) {
      throw error;
    }
  }

  const [fundingJson, jsonHighlight] = getChangedTemplate(fundingObject, address, network);

  context.update((c) => {
    c.funding = {
      object: fundingObject,
      json: fundingJson,
      highlight: jsonHighlight,
    };
    return c;
  });
}
