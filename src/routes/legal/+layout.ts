import { redirect } from '@sveltejs/kit';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';

export const prerender = true;

export async function load({ route }) {
  // TODO: Remove when we go full multi-chain.
  const isAlternativeChain = getOptionalEnvVar('PUBLIC_ALTERNATIVE_CHAIN_MODE');
  if (isAlternativeChain) {
    // Serve from the `mainnet` instance
    return redirect(308, `https://drips.network${route.id}`);
  }
}
