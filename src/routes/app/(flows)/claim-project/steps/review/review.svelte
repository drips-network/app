<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import UlIconLi from '$lib/components/ul-icon-li/ul-icon-li.svelte';
  import SplitsIcon from 'radicle-design-system/icons/Splits.svelte';
  import EyeOpenIcon from 'radicle-design-system/icons/EyeOpen.svelte';
  import TokenStreamsIcon from 'radicle-design-system/icons/TokenStreams.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import ProjectProfileHeader from '$lib/components/project-profile-header/project-profile-header.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import { get, writable, type Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Splits, { mapSplitsFromListEditorData } from '$lib/components/splits/splits.svelte';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import Drip from '$lib/components/illustrations/drip.svelte';
  import modal from '$lib/stores/modal';
  import ProjectCustomizerModal from './components/project-customizer-modal.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: project = $context.project ?? unreachable();

  // For previewing what the project will look like after claiming
  $: fakeClaimedProject = {
    ...project,
    claimed: true as const,
    owner: {
      driver: 'address' as const,
      address: $walletStore.address ?? unreachable(),
      accountId: $walletStore.dripsAccountId ?? unreachable(),
    },
    color: $context.projectColor,
    emoji: $context.projectEmoji,
    splits: { maintainers: [], dependencies: [] },
  };

  $: dependencyRepresentationalSplits = mapSplitsFromListEditorData(
    $context.dependencySplits.items,
    $context.dependencySplits.percentages,
    $context.highLevelPercentages['dependencies'],
  );

  $: maintainerRepresentationalSplits = mapSplitsFromListEditorData(
    $context.maintainerSplits.items,
    $context.maintainerSplits.percentages,
    $context.highLevelPercentages['maintainers'],
  );

  async function submit() {
    if ($context.isPartiallyClaimed) {
      dispatch('goForward', { by: 2 });
      return;
    }

    dispatch('goForward');
  }

  function customize() {
    const projectWritable = writable(fakeClaimedProject);

    modal.show(
      ProjectCustomizerModal,
      () => {
        const { emoji, color } = get(projectWritable);

        $context.projectEmoji = emoji;
        $context.projectColor = color;
      },
      { project: projectWritable },
    );
  }
</script>

<StandaloneFlowStepLayout
  headline="Review"
  description="You’re almost done claiming your project and funds. Please review all details."
>
  <FormField type="div" title="Git project">
    <div class="card">
      <ProjectProfileHeader
        project={fakeClaimedProject}
        editButton="Customize"
        on:editButtonClick={customize}
      />
    </div>
  </FormField>
  <FormField type="div" title="Owned by">
    <svelte:fragment slot="action">
      <Button variant="ghost" on:click={() => dispatch('goForward', { by: -5 })} icon={PenIcon}
        >Edit</Button
      >
    </svelte:fragment>
    <AccountBox hideDisconnect />
  </FormField>
  <FormField type="div" title="Claimable funds">
    <UnclaimedProjectCard unclaimedFunds={$context.unclaimedFunds} />
  </FormField>
  <!-- TODO: Show the actual amounts that will be split on tx confirmation -->
  <FormField type="div" title="Split funds with">
    <svelte:fragment slot="action">
      <Button variant="ghost" on:click={() => dispatch('goForward', { by: -3 })} icon={PenIcon}
        >Edit</Button
      >
    </svelte:fragment>
    <div class="card">
      <!-- TODO: Show the total amount that will be split on tx confirmation -->
      <div class="drip-icon">
        <Drip />
      </div>
      <div class="splits-component">
        <Splits
          linkToNewTab={true}
          list={[
            {
              type: 'split-group',
              name: 'Dependencies',
              list: dependencyRepresentationalSplits,
            },
            {
              type: 'split-group',
              name: 'Maintainers',
              list: maintainerRepresentationalSplits,
            },
          ]}
        />
      </div>
    </div>
  </FormField>
  <div class="whats-next">
    <div class="card">
      <h4>On transaction confirmation…</h4>
      <ul>
        <UlIconLi icon={SplitsIcon}
          >All claimable funds will be <span class="typo-text-bold"
            >immediately split as shown above</span
          >.</UlIconLi
        >
      </ul>
    </div>
    <div class="card">
      <h4>After transaction confirmation…</h4>
      <ul>
        <UlIconLi icon={EyeOpenIcon}>Anyone can support or split to your project on Drips.</UlIconLi
        >
        <UlIconLi icon={WalletIcon}
          >You can <span class="typo-text-bold">collect your tokens</span> from your
          <span class="typo-text-bold">Drips dashboard</span>.</UlIconLi
        >
        <UlIconLi icon={TokenStreamsIcon}
          >Future incoming funds will be split to your recipients <span class="typo-text-bold"
            >weekly</span
          >.</UlIconLi
        >
      </ul>
    </div>
  </div>
  <svelte:fragment slot="left-actions">
    <Button
      icon={ArrowLeft}
      on:click={() =>
        dispatch('goForward', {
          by: $context.highLevelPercentages['dependencies'] === 0 ? -2 : -1,
        })}>Back</Button
    >
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button icon={WalletIcon} variant="primary" on:click={submit}>Confirm in wallet</Button>
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .card {
    background-color: var(--color-background);
    padding: 1rem;
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    overflow-x: scroll;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .whats-next {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }

  .drip-icon {
    width: 1.5rem;
  }

  .splits-component {
    margin-left: 10px;
    width: fit-content;
  }
</style>
