import { error, redirect } from '@sveltejs/kit';
import network, { getNetwork, isSupportedChainId } from '$lib/stores/wallet/network';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
  const chainIdParam = url.searchParams.get('chainId');
  const chainId = chainIdParam !== null ? Number(chainIdParam) : NaN;

  if (!Number.isFinite(chainId) || !isSupportedChainId(chainId)) {
    throw error(400, 'Missing or unsupported chainId query parameter');
  }

  const targetPath = `/app/rpgf/external-vote-landing${url.search}`;

  // Same deployment — redirect locally
  if (chainId === network.chainId) {
    throw redirect(307, targetPath);
  }

  // Different deployment — forward to the correct subdomain
  const targetUrl = `https://${getNetwork(chainId).subdomain}${targetPath}`;
  throw redirect(307, targetUrl);
};
