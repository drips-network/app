import walletStore from '$lib/stores/wallet/wallet.store';
import modal from '$lib/stores/modal';
import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import buildUrl from './build-url';

export default function launchClaimProject(projectUrl?: string) {
  if (get(walletStore).connected) {
    modal.show(ClaimProjectStepper, undefined, {
      skipWalletConnect: true,
      ...(projectUrl && { projectUrl }),
    });
    return;
  }

  const claimProjectPath = '/app/claim-project';
  if (projectUrl) {
    return goto(buildUrl(claimProjectPath, { projectToAdd: projectUrl }));
  }

  goto(claimProjectPath);
}
