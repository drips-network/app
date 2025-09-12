import walletStore from '$lib/stores/wallet/wallet.store';
import modal from '$lib/stores/modal';
import ClaimOrcidStepper from '$lib/flows/claim-orcid-flow/claim-orcid-stepper.svelte';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import buildUrl from './build-url';

export default function launchClaimOrcid(orcidId?: string) {
  if (get(walletStore).connected) {
    modal.show(ClaimOrcidStepper, undefined, {
      skipWalletConnect: true,
      orcidId,
    });
    return;
  }

  const claimOrcidPath = '/app/claim-orcid';
  if (orcidId) {
    goto(buildUrl(claimOrcidPath, { orcidId }));
    return;
  }

  goto(claimOrcidPath);
}
