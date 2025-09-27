<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Orcid from '$lib/components/icons/Orcid.svelte';
  import MultiChain from '$lib/components/illustrations/multi-chain.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { steps } from '$lib/flows/claim-orcid-flow/claim-orcid-flow';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import launchClaimOrcid from '$lib/utils/launch-claim-orcid';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  const headline = 'Link identity';
  const description = 'Select an identity type:';

  function launchSpecificIdentityFlow() {
    const walletConnected = $walletStore.connected;
    // TODO; will this ever not be connected?
    // If a wallet is connected, sidestep for a nice transition
    if (walletConnected) {
      return dispatch('sidestep', {
        steps: steps(undefined, !walletConnected),
      });
    }

    // otherwise, launch the flow from its own page
    launchClaimOrcid();
  }
</script>

<StepLayout>
  <StepHeader {headline} {description}>
    <svelte:fragment slot="emoji">
      <div class="large-illustration">
        <div class="large-illustration-inner">
          <MultiChain></MultiChain>
        </div>
      </div>
    </svelte:fragment>
  </StepHeader>
  <Button variant="muted" size="large" on:click={launchSpecificIdentityFlow}>
    <Orcid style="fill: var(--color-foreground); width: 2rem;" />ORCID</Button
  >
  <p>More types of identities coming soon.</p>
</StepLayout>

<style>
  .large-illustration {
    position: relative;
    height: 200px;
    z-index: 0;
    overflow: hidden;
    margin: -1.5rem;
  }

  .large-illustration .large-illustration-inner {
    position: absolute;
    z-index: 0;
    top: -100%;
    transform: rotate(118deg);
  }

  @media (max-width: 882px) {
    .large-illustration {
      margin: -1rem;
    }
  }

  @media (max-width: 514px) {
    .large-illustration {
      height: 160px;
    }
  }
</style>
