import type { State } from '../../claim-project-flow';
import unreachable from '$lib/utils/unreachable';
import { getChangedTemplate } from '../add-ethereum-address/drips-json-template';
import GitHub from '$lib/utils/github/GitHub';
import { get, type Writable } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit();
const github = new GitHub(octokit);

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

  let fundingObject = {};
  let fundingJson = '';
  let jsonHighlight: [number | null, number | null] = [null, null];

  try {
    const $context = get(context);
    const { ownerName, repoName } = $context.project?.source ?? unreachable();
    fundingObject = await github.fetchFundingJson(ownerName, repoName);
    [fundingJson, jsonHighlight] = getChangedTemplate(fundingObject, address, network);
  } catch (error) {
    // If the FUNDING.json is not found, not parseable, or has an invalid structure, that's fine.
    // It means we need a new one, so we continue below with an empty funding object.
    // The user will be prompted to create a valid FUNDING.json in the next step
    // (add-ethereum-address), where verifyFundingJson() will properly validate the file.
    if ((error as Error).message.includes('not found')) {
      // File not found - continue with empty object
      [fundingJson, jsonHighlight] = getChangedTemplate(fundingObject, address, network);
    } else {
      // Any other error (parsing error, invalid structure, etc.) - continue with empty object
      [fundingJson, jsonHighlight] = getChangedTemplate({}, address, network);
    }
  }

  context.update((c) => {
    c.funding = {
      object: fundingObject,
      json: fundingJson,
      highlight: jsonHighlight,
    };
    return c;
  });
}
