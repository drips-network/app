<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import getChainDeploymentUrl from '$lib/components/network-picker/get-chain-deployment-url';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import network, { NETWORK_CONFIG } from '$lib/stores/wallet/network';
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  const currentNetworkIsTestnet = network.isTestnet;
  const availableNetworks = currentNetworkIsTestnet
    ? Object.values(NETWORK_CONFIG)
    : Object.values(NETWORK_CONFIG).filter((n) => !n.isTestnet);

  let selectedNetworkId = network.chainId;

  // Disable the warning on navigate away, because the user hasn't yet entered any info and might want to
  // switch to a different network deployment.
  onMount(() => {
    modal.setWarnOnNavigate(false);
  });
</script>

<StandaloneFlowStepLayout
  headline="Where do you want to claim?"
  description="Choose which network you'd like to claim your project on. You can claim on as many networks as you like."
>
  <div class="inner">
    <div class="networks">
      {#each availableNetworks as network}
        <div class="network typo-text-bold">
          <input
            bind:group={selectedNetworkId}
            name="network"
            type="radio"
            id="network-{network.chainId}"
            value={network.chainId}
          />
          <label for="network-{network.chainId}">
            <svelte:component this={network.icon} />
            <div>{network.label}</div>
          </label>
        </div>
      {/each}
    </div>
    {#if selectedNetworkId !== network.chainId}
      {@const selectedNetwork = NETWORK_CONFIG[selectedNetworkId]}
      <div transition:slide={{ duration: 300 }} class="switch-network-prompt">
        <AnnotationBox>
          To claim on {selectedNetwork.label}, switch your current network.
          <svelte:fragment slot="actions">
            <Button
              variant="primary"
              target="_self"
              href={getChainDeploymentUrl(selectedNetwork.chainId)}
              >Switch to {selectedNetwork.label}</Button
            >
          </svelte:fragment>
        </AnnotationBox>
      </div>
    {/if}
  </div>
  <svelte:fragment slot="actions">
    <Button
      variant="primary"
      icon={ArrowRight}
      disabled={selectedNetworkId !== network.chainId}
      on:click={() => dispatch('goForward')}
    >
      Continue
    </Button>
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .networks {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .networks .network label {
    border: 1px solid var(--color-foreground);
    padding: 1rem;
    min-height: 8rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
    border-radius: 1rem 0 1rem 1rem;
    cursor: pointer;
    transition:
      background-color 0.3s,
      border 0.3s,
      color 0.3s;
  }

  .networks .network label:hover {
    background-color: var(--color-foreground-level-1);
  }

  .networks input {
    display: none;
  }

  .networks .network input:checked + label {
    background-color: var(--color-primary-level-1);
    border: 1px solid var(--color-primary);
    color: var(--color-primary-level-6);
  }

  .switch-network-prompt {
    margin-top: 1rem;
  }
</style>
