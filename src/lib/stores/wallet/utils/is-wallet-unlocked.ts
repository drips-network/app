// Adjusted from https://github.com/safe-global/safe-wallet-web/blob/234525f42ed6f2326ae3c5157e889aec87b5411a/src/utils/wallets.ts#L29-L58

import { browser } from '$app/environment';

/* Check if the wallet is unlocked. */
export const isWalletUnlocked = async (walletName: string): Promise<boolean> => {
  if (!browser) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  if (win.ethereum?.isConnected?.()) {
    return true;
  }

  // Only MetaMask exposes a method to check if the wallet is unlocked
  if (walletName === 'metamask' || walletName === 'brave browser' || win.ethereum.isMetamask) {
    return win.ethereum?._metamask?.isUnlocked?.() || false;
  }

  // Wallet connect creates a localStorage entry when connected and removes it when disconnected
  if (walletName === 'walletconnect') {
    return win.localStorage.getItem('walletconnect') !== null;
  }

  return false;
};
