<script lang="ts" context="module">
  export const REVIEW_STEP_UNCLAIMED_PROJECT_FRAGMENT = gql`
    ${UNCLAIMED_PROJECT_CARD_FRAGMENT}
    fragment ReviewStepUnclaimedProject on Project {
      ...UnclaimedProjectCard
    }
  `;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { createEventDispatcher } from 'svelte';
  import { makeStep, type StepComponentEvents } from '$lib/components/stepper/types';
  import WalletIcon from '$lib/components/icons/Wallet.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import SplitsIcon from '$lib/components/icons/Splits.svelte';
  import EyeOpenIcon from '$lib/components/icons/EyeOpen.svelte';
  import TokenStreamsIcon from '$lib/components/icons/TokenStreams.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import ProjectProfileHeader from '$lib/components/project-profile-header/project-profile-header.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import { get, writable, type Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import UnclaimedProjectCard, {
    UNCLAIMED_PROJECT_CARD_FRAGMENT,
  } from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Splits from '$lib/components/splits/splits.svelte';
  import PenIcon from '$lib/components/icons/Pen.svelte';
  import Drip from '$lib/components/illustrations/drip.svelte';
  import modal from '$lib/stores/modal';
  import ProjectCustomizerModal from './components/project-customizer-modal.svelte';
  import type { ProjectProfileHeaderFragment } from '$lib/components/project-profile-header/__generated__/gql.generated';
  import { gql } from 'graphql-request';
  import Download from '$lib/components/icons/Download.svelte';
  import ProjectCustomizerStep from './components/project-customizer-step.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import network from '$lib/stores/wallet/network';
  import { mapSplitsFromListEditorData } from '$lib/components/splits/utils';
  import sanitize from 'sanitize-html';
  import WhatsNextSection from '$lib/components/whats-next/whats-next-section.svelte';
  import WhatsNextCard from '$lib/components/whats-next/whats-next-card.svelte';
  import WhatsNextItem from '$lib/components/whats-next/whats-next-item.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let canEditWalletConnection = true;
  export let isModal = false;

  $: project = $context.project ?? unreachable();

  // For previewing what the project will look like after claiming
  let fakeClaimedProject: ProjectProfileHeaderFragment;
  $: fakeClaimedProject = {
    __typename: 'Project',
    source: { ...project.source },
    isVisible: true,
    chainData: [
      {
        owner: {
          __typename: 'AddressDriverAccount',
          address: $walletStore.address ?? unreachable(),
        },
        __typename: 'ClaimedProjectData',
        chain: network.gqlName,
        color: $context.projectColor,
        avatar:
          $context.avatar.type === 'emoji'
            ? {
                __typename: 'EmojiAvatar',
                emoji: $context.avatar.emoji,
              }
            : {
                __typename: 'ImageAvatar',
                cid: $context.avatar.cid,
              },
      },
    ],
  };

  $: dependencyRepresentationalSplits = mapSplitsFromListEditorData(
    $context.dependencySplits.items,
    $context.dependencySplits.weights,
    $context.highLevelPercentages['dependencies'],
  );

  $: maintainerRepresentationalSplits = mapSplitsFromListEditorData(
    $context.maintainerSplits.items,
    $context.maintainerSplits.weights,
    $context.highLevelPercentages['maintainers'],
  );

  async function submit() {
    dispatch('goForward');
  }

  function customize() {
    const newProjectDataWritable = writable({
      ...filterCurrentChainData(fakeClaimedProject.chainData, 'claimed'),
      isProjectVisible: true,
    });

    if (isModal) {
      dispatch('sidestep', {
        steps: [
          makeStep({
            component: ProjectCustomizerStep,
            props: {
              originalProject: project,
              newProjectData: newProjectDataWritable,
            },
          }),
        ],
      });
    } else {
      modal.show(
        ProjectCustomizerModal,
        () => {
          const { avatar, color } = get(newProjectDataWritable);

          $context.avatar =
            avatar.__typename === 'EmojiAvatar'
              ? { type: 'emoji', emoji: avatar.emoji }
              : { type: 'image', cid: avatar.cid };
          $context.projectColor = color;
        },
        { originalProject: project, newProjectData: newProjectDataWritable },
      );
    }
  }

  $: projectChainData = filterCurrentChainData(project.chainData, 'unclaimed');

  $: hasCollectableAmount =
    projectChainData.withdrawableBalances.filter((wb) => BigInt(wb.collectableAmount) > 0n).length >
    0;
  $: hasSplittableAmount =
    projectChainData.withdrawableBalances.filter((wb) => BigInt(wb.splittableAmount) > 0n).length >
    0;
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
      {#if canEditWalletConnection}
        <Button variant="ghost" on:click={() => dispatch('goForward', { by: -5 })} icon={PenIcon}
          >Edit</Button
        >
      {/if}
    </svelte:fragment>
    <AccountBox hideDisconnect />
  </FormField>
  <FormField type="div" title="Claimable funds">
    <UnclaimedProjectCard
      detailedTokenBreakdown={hasCollectableAmount && hasSplittableAmount}
      {project}
    />
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
              __typename: 'SplitGroup',
              name: 'Dependencies',
              list: dependencyRepresentationalSplits,
            },
            {
              __typename: 'SplitGroup',
              name: 'Maintainers',
              list: maintainerRepresentationalSplits,
            },
          ]}
        />
      </div>
    </div>
  </FormField>
  <WhatsNextSection>
    {#if hasCollectableAmount || hasSplittableAmount}
      <WhatsNextCard>
        <svelte:fragment slot="title">On transaction confirmation...</svelte:fragment>
        <svelte:fragment slot="items">
          {#if hasCollectableAmount && hasSplittableAmount}
            <WhatsNextItem icon={Download}
              >Some of your claimable funds will be <span class="typo-text-bold"
                >collected directly to your connected wallet</span
              > as shown above.</WhatsNextItem
            >
            <WhatsNextItem icon={SplitsIcon}
              >Remaining claimable funds will be <span class="typo-text-bold"
                >immediately split</span
              > as shown above.</WhatsNextItem
            >
          {:else if hasCollectableAmount}
            <WhatsNextItem icon={SplitsIcon}
              >Claimable funds will be <span class="typo-text-bold"
                >collected directly to your connected wallet</span
              > as shown above.</WhatsNextItem
            >
          {:else if hasSplittableAmount}
            <WhatsNextItem icon={SplitsIcon}
              >All claimable funds will be <span class="typo-text-bold"
                >immediately split as shown above</span
              >.</WhatsNextItem
            >
          {/if}
        </svelte:fragment>
      </WhatsNextCard>
    {/if}
    <WhatsNextCard>
      <svelte:fragment slot="title">After transaction confirmation...</svelte:fragment>
      <svelte:fragment slot="items">
        <WhatsNextItem icon={EyeOpenIcon}
          >Anyone can support or split to your project on Drips.</WhatsNextItem
        >
        <WhatsNextItem icon={WalletIcon}
          >You can <span class="typo-text-bold">collect your tokens</span> from your
          <span class="typo-text-bold">Drips dashboard</span>.</WhatsNextItem
        >
        <WhatsNextItem icon={TokenStreamsIcon}>
          {@html sanitize(network.settlement.recipientsExplainerHtml, {
            allowedTags: ['span'],
            allowedAttributes: {
              span: ['class'],
            },
          })}</WhatsNextItem
        >
      </svelte:fragment>
    </WhatsNextCard>
  </WhatsNextSection>
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
  .drip-icon {
    width: 1.5rem;
  }

  .splits-component {
    margin-left: 10px;
    width: fit-content;
  }
</style>
