import walletStore from '$lib/stores/wallet/wallet.store';
import buildUrl from '$lib/utils/build-url';
import { getUserData, rpgfJwtStore } from '$lib/utils/rpgf/siwe';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

function getSignInData() {
  const jwt = get(rpgfJwtStore);
  return getUserData(jwt);
}

// TODO(rpgf): Somehow prevent this from erasing the JWT on every app init
export const load = async ({ url }) => {
  const { walletAddress: rpgfWalletAddress, exp } = getSignInData() ?? {};

  const { address } = get(walletStore);

  if (exp && exp < Date.now() / 1000) {
    // User's sign-in is expired, so redirect to connect page
    return redirect(
      307,
      buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
    );
  }

  if (address && !rpgfWalletAddress) {
    // User is connected but not signed in to RPGF, so make them sign in
    return redirect(
      307,
      buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
    );
  }

  if (address && rpgfWalletAddress && address.toLowerCase() !== rpgfWalletAddress.toLowerCase()) {
    // User is signed-in with a different wallet address than the one connected, so clear sign-in and
    // make them connect again
    rpgfJwtStore.set(null);
    return redirect(
      307,
      buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
    );
  }

  if (!address && rpgfWalletAddress) {
    // User is signed-in to RPGF but not connected, so clear the sign-in
    rpgfJwtStore.set(null);
  }

  const updatedSignInData = getSignInData();

  return {
    rpgfUserData: updatedSignInData,
  };
};

export const ssr = false;
