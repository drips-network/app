<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { Writable } from 'svelte/store';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { State } from '../../claim-project-flow';
  import LinkIcon from 'radicle-design-system/icons/Link.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { VerificationStatus } from '$lib/utils/metadata/types';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import isValidUrl from '$lib/utils/is-valid-url';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import { fly } from 'svelte/transition';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let validationState: TextInputValidationState = { type: 'unvalidated' };

  async function fetchProjectMetadata() {
    // TODO: Really fetch project metadata from github / gitlab

    await new Promise((resolve) => setTimeout(resolve, 1000));

    $context.projectMetadata = {
      description: 'A Svelte store that persists to localStorage',
      starCount: 42,
      forkCount: 2,
    };
  }

  async function fetchUnclaimedFunds() {
    // TODO: Really fetch project's unclaimed funds

    $context.unclaimedFunds = [
      {
        tokenAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        amount: 100000000000000000000n,
      },
    ];

    fiatEstimates.track(['WETH']);
  }

  $: priceStore = fiatEstimates.price(['WETH']);

  let unclaimedFundsFiatEstimate: number | 'pending' = 'pending';
  let unclaimedFundsIncludeUnknown = false;

  $: {
    const prices = $priceStore;

    unclaimedFundsIncludeUnknown = false;

    const unclaimedFunds = $context.unclaimedFunds ?? [];

    if (Object.values(prices).includes('pending')) {
      unclaimedFundsFiatEstimate = 'pending';
    } else {
      unclaimedFundsFiatEstimate = unclaimedFunds.reduce((sum, { tokenAddress, amount }) => {
        const res = fiatEstimates.convert({ amount, tokenAddress });

        if (res === 'unsupported') {
          unclaimedFundsIncludeUnknown = true;
          return sum;
        }

        if (!res || res === 'pending') {
          return sum;
        }

        return sum + res / 100;
      }, 0);
    }
  }

  async function fetchProject() {
    // TODO: Really fetch project

    validationState = { type: 'pending' };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    $context.project = {
      claimed: false,
      repoDriverAccount: {
        userId: '0',
        driver: 'repo',
      },
      source: {
        forge: 'github',
        repoName: 'svelte-stored-writable',
        ownerName: 'efstajas',
        url: 'https://github.com/efstajas/svelte-stepper.git',
      },
      verificationStatus: VerificationStatus.NOT_STARTED,
      owner: undefined,
    };

    await fetchProjectMetadata();
    await fetchUnclaimedFunds();

    validationState = { type: 'valid' };
  }

  // TODO: Check if it's a valid git project URL
  $: if (isValidUrl($context.gitUrl) && validationState.type === 'unvalidated') {
    fetchProject();
  }

  function clearProject() {
    $context.gitUrl = '';
    $context.project = undefined;
    $context.projectMetadata = undefined;

    validationState = { type: 'unvalidated' };
  }

  $: formValid = validationState.type === 'valid';
</script>

<StandaloneFlowStepLayout
  description="Enter your Git project’s URL to see if it has claimable funds and start the registration."
>
  <TextInput
    bind:value={$context.gitUrl}
    icon={LinkIcon}
    placeholder="Paste GitHub or GitLab project URL"
    disabled={validationState.type !== 'unvalidated'}
    {validationState}
  />
  <Button on:click={clearProject}>Clear</Button>
  {#if $context.project && validationState.type === 'valid'}
    <div class="project-info" transition:fly={{ y: 8, duration: 300 }}>
      <ProjectBadge project={$context.project} />
      {#if $context.projectMetadata?.description}
        <p class="description typo-text">
          {$context.projectMetadata.description}
        </p>
      {/if}
      {#if $context.unclaimedFunds}
        ≈{unclaimedFundsFiatEstimate}
      {/if}
    </div>
  {/if}
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={ArrowRightIcon}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .project-info {
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    box-shadow: var(--elevation-low);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
</style>
