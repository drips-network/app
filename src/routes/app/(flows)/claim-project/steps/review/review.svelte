<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
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
  import Splits, {
    type Split as RepresentationalSplit,
  } from '$lib/components/splits/splits.svelte';
  import type { Items, Percentages } from '$lib/components/list-editor/list-editor.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import Drip from '$lib/components/illustrations/drip.svelte';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
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

  function getRepresentationalSplits(
    selected: string[],
    items: Items,
    percentages: Percentages,
    group: 'dependencies' | 'maintainers',
  ): RepresentationalSplit[] {
    return mapFilterUndefined(selected, (slug) => {
      const item = items[slug];
      const groupPercentage = $context.highLevelPercentages[group];

      const percentage = (groupPercentage / 100) * (percentages[slug] / 100) * 1000000;

      if (!percentage) return;

      if (item.type === 'interstitial') return;

      if ('project' in item.label.props) {
        return {
          type: 'project-split',
          project: item.label.props.project,
          weight: percentage,
        };
      } else {
        return {
          type: 'address-split',
          address: item.label.props.address,
          weight: percentage,
        };
      }
    });
  }

  $: dependencyRepresentationalSplits = getRepresentationalSplits(
    $context.dependencySplits.selected,
    $context.dependencySplits.items,
    $context.dependencySplits.percentages,
    'dependencies',
  );

  $: maintainerRepresentationalSplits = getRepresentationalSplits(
    $context.maintainerSplits.selected,
    $context.maintainerSplits.items,
    $context.maintainerSplits.percentages,
    'maintainers',
  );

  let gitProjectService: GitProjectService;

  onMount(async () => {
    gitProjectService = await GitProjectService.new();
  });

  async function requestOwnerUpdate() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const requestOwnerUpdateTx = gitProjectService.buildRequestOwnerUpdateTx($context);

          return { requestOwnerUpdateTx };
        },
        transactions: ({ requestOwnerUpdateTx }) => ({
          transaction: () => requestOwnerUpdateTx,
          waitingSignatureMessage: {
            message: 'Waiting for you to confirm the transaction in your wallet…',
            subtitle:
              "The first transaction validates your project's FUNDING.json file on-chain. You'll need to send a second transaction after to finalize the claiming process.",
          },
        }),
      }),
    );
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
      <ProjectProfileHeader project={fakeClaimedProject} />
      <Button icon={Pen} on:click={customize}>Customize</Button>
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
    <p>
      You'll need to send two transactions to claim your project. The first one validates your
      FUNDING.json file on-chain, and the second applies your split configuration. Click "Confirm in
      Wallet" to get started.
    </p>
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
        })}>Go back</Button
    >
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button icon={WalletIcon} variant="primary" on:click={requestOwnerUpdate}
      >Confirm in wallet</Button
    >
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
  }
</style>
