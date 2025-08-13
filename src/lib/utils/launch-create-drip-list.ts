import walletStore from '$lib/stores/wallet/wallet.store';
import modal from '$lib/stores/modal';
import CreateDripListStepper from '$lib/flows/create-drip-list-flow/create-drip-list-stepper.svelte';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';

export default function launchCreateDripList() {
  if (get(walletStore).connected) {
    modal.show(CreateDripListStepper, undefined, {
      skipWalletConnect: true,
      isModal: true,
    });
    return;
  }

  goto('/app/funder-onboarding');
}
