import { page } from '$app/state';
import { getNetwork, SUPPORTED_CHAIN_IDS } from '$lib/stores/wallet/network';

export default function getChainDeploymentUrl(chainId: (typeof SUPPORTED_CHAIN_IDS)[number]) {
  const currentPage = page;

  const path = currentPage.url.pathname;

  const url = new URL(`https://${getNetwork(chainId).subdomain}${path}`);

  if (!currentPage.data.preservePathOnNetworkChange) {
    url.pathname = '/app';
  }

  return url.href;
}
