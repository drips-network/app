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
  import { VerificationStatus, type ClaimedGitProject } from '$lib/utils/metadata/types';
  import isValidUrl from '$lib/utils/is-valid-url';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import projectItem from '$lib/components/list-editor/item-templates/project';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let validationState: TextInputValidationState = { type: 'unvalidated' };

  async function fetchProjectMetadata() {
    // TODO: Really fetch project metadata from github

    await new Promise((resolve) => setTimeout(resolve, 200));

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
        tokenAddress: '0x7439E9Bb6D8a84dd3A23fe621A30F95403F87fB9',
        amount: 1500000000000000000n,
      },
      {
        tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        amount: 100000000000000000000n,
      },
      // UNCOMMENT THIS FOR AN UNKNOWN TOKEN AMOUNT
      // {
      //   tokenAddress: '0x0000000000000000000000000000000000000000',
      //   amount: 100000000000000000000n,
      // }
    ];
  }

  async function prePopulateDependencies() {
    if (Object.keys($context.dependencySplits.items).length > 0) return;

    // TODO: Really fetch dependencies
    $context.dependencySplits.items = {
      foobar: projectItem({
        claimed: true,
        repoDriverAccount: {
          userId: '0',
          driver: 'repo',
        },
        source: {
          forge: 'github',
          repoName: 'svelte',
          ownerName: 'sveltejs',
          url: 'https://github.com/sveltejs/svelte.git',
        },
        owner: {
          address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
          userId: '1234',
          driver: 'address',
        },
        emoji: '🦸',
        color: '#ff0008',
      } as ClaimedGitProject),
    };
    $context.dependencySplits.selected = ['foobar'];
    $context.dependencySplits.percentages = { foobar: 100 };
    $context.dependenciesAutoImported = true;
  }

  async function fetchProject() {
    // TODO: Really fetch project

    validationState = { type: 'pending' };

    await new Promise((resolve) => setTimeout(resolve, 200));

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

    // TODO: Validate that project is unclaimed

    // TODO: Parallelize these requests
    await fetchProjectMetadata();
    await fetchUnclaimedFunds();
    await prePopulateDependencies();

    validationState = { type: 'valid' };
  }

  // TODO: Check if it's a valid git project URL
  $: if (isValidUrl($context.gitUrl) && validationState.type === 'unvalidated') {
    fetchProject();
  }

  function clearProject() {
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
    placeholder="Paste GitHub project URL"
    disabled={validationState.type !== 'unvalidated'}
    {validationState}
    showClearButton={validationState.type === 'valid'}
    on:clear={clearProject}
  />
  {#if $context.project && validationState.type === 'valid'}
    <UnclaimedProjectCard
      project={$context.project}
      projectMetadata={$context.projectMetadata}
      unclaimedFunds={$context.unclaimedFunds}
    />
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
