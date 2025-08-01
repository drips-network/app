import network from '$lib/stores/wallet/network.js';
import walletStore from '$lib/stores/wallet/wallet.store';
import buildUrl from '$lib/utils/build-url';
import { getUserData, logOut, refreshAccessToken, rpgfAccessJwtStore } from '$lib/utils/rpgf/siwe';
import { error, redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

function getSignInData() {
  const jwt = get(rpgfAccessJwtStore);
  return getUserData(jwt);
}

// TODO(rpgf): Somehow prevent this from erasing the JWT on every app init
export const load = async ({ url }) => {
  if (!network.retroFunding.enabled) {
    throw error(404);
  }

  const { walletAddress: rpgfWalletAddress, exp } = getSignInData() ?? {};

  const { address } = get(walletStore);

  if (exp && exp < Date.now() / 1000) {
    // User's sign-in is expired, so attempt refresh and if it doesn't work, redirect to connect
    const { success } = await refreshAccessToken();

    if (!success) {
      return redirect(
        307,
        buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
      );
    }
  }

  if (address && !rpgfWalletAddress) {
    // User is connected but not signed in to RPGF, so make them sign in
    return redirect(
      307,
      buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
    );
  }

  if (address && rpgfWalletAddress && address.toLowerCase() !== rpgfWalletAddress.toLowerCase()) {
    await logOut();

    return redirect(
      307,
      buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
    );
  }

  const updatedSignInData = getSignInData();

  return {
    // Only consider the user signed in if they have a wallet connected
    rpgfUserData: address ? updatedSignInData : null,
  };
};

export const ssr = false;
