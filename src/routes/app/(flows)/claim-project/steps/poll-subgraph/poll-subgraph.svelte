<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { VerificationStatus } from '$lib/utils/metadata/types';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { ethers } from 'ethers';
  import assert from '$lib/utils/assert';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() =>
    dispatch('await', {
      promise: pollSubgraph,
      message: 'Checking if the Drips Subgraph is updated. This may take a while...',
    }),
  );

  async function pollSubgraph() {
    let start = Date.now();
    let timeout = 5 * 60 * 1000; // Timeout after 5 minutes

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const gitProjectService = await GitProjectService.new();
      const project = await gitProjectService.getByUrl($context.gitUrl, false);

      assert($walletStore.address);
      if (
        project?.claimed &&
        ethers.utils.getAddress(project.owner.address) ===
          ethers.utils.getAddress($walletStore.address)
      ) {
        return;
      }

      if (!project?.claimed) {
        if (Date.now() - start >= timeout) {
          throw new Error('Project verification failed after 5'); // Throw error after timeout
        }
        if (project.verificationStatus === VerificationStatus.FAILED) {
          throw new Error('Project verification failed');
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before the next request
    }
  }
</script>
