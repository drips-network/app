import { page } from '$app/stores';
import { getNetwork, SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';
import { get } from 'svelte/store';

export default function getChainDeploymentUrl(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]) {
  const currentPage = get(page);

  const path = currentPage.url.pathname;

  const url = new URL(`https://${getNetwork(chainId).subdomain}${path}`);

  if (!currentPage.data.preservePathOnNetworkChange) {
    url.pathname = '/app';
  }

  return url.href;
}
