<script lang="ts" context="module">
  export const REVIEW_STEP_PROJECT_FRAGMENT = gql`
    ${PROJECT_PROFILE_HEADER_FRAGMENT}
    fragment ReviewStepProject on Project {
      ... on ClaimedProject {
        ...ProjectProfileHeader
      }
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
  import UlIconLi from '$lib/components/ul-icon-li/ul-icon-li.svelte';
  import SplitsIcon from '$lib/components/icons/Splits.svelte';
  import EyeOpenIcon from '$lib/components/icons/EyeOpen.svelte';
  import TokenStreamsIcon from '$lib/components/icons/TokenStreams.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import ProjectProfileHeader, {
    PROJECT_PROFILE_HEADER_FRAGMENT,
  } from '$lib/components/project-profile-header/project-profile-header.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import { get, writable, type Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import UnclaimedProjectCard from '$lib/components/unclaimed-project-card/unclaimed-project-card.svelte';
  import Splits, { mapSplitsFromListEditorData } from '$lib/components/splits/splits.svelte';
  import PenIcon from '$lib/components/icons/Pen.svelte';
  import Drip from '$lib/components/illustrations/drip.svelte';
  import modal from '$lib/stores/modal';
  import ProjectCustomizerModal from './components/project-customizer-modal.svelte';
  import type { ProjectProfileHeader_ClaimedProject_Fragment } from '$lib/components/project-profile-header/__generated__/gql.generated';
  import { gql } from 'graphql-request';
  import Download from '$lib/components/icons/Download.svelte';
  import ProjectCustomizerStep from './components/project-customizer-step.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let canEditWalletConnection = true;
  export let isModal = false;

  $: project = $context.project ?? unreachable();

  // For previewing what the project will look like after claiming
  let fakeClaimedProject: ProjectProfileHeader_ClaimedProject_Fragment;
  $: fakeClaimedProject = {
    __typename: 'ClaimedProject',
    source: { ...project.source },
    owner: {
      __typename: 'AddressDriverAccount',
      address: $walletStore.address ?? unreachable(),
    },
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

    if (isModal) {
      dispatch('sidestep', {
        steps: [
          makeStep({
            component: ProjectCustomizerStep,
            props: {
              project: projectWritable,
            },
          }),
        ],
      });
    } else {
      modal.show(
        ProjectCustomizerModal,
        () => {
          const { avatar, color } = get(projectWritable);

          $context.avatar =
            avatar.__typename === 'EmojiAvatar'
              ? { type: 'emoji', emoji: avatar.emoji }
              : { type: 'image', cid: avatar.cid };
          $context.projectColor = color;
        },
        { project: projectWritable },
      );
    }
  }

  $: hasCollectableAmount =
    $context.unclaimedFunds?.collectable && $context.unclaimedFunds?.collectable?.length > 0;
  $: hasSplittableAmount =
    $context.unclaimedFunds?.splittable && $context.unclaimedFunds?.splittable?.length > 0;
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
      unclaimedFunds={$context.unclaimedFunds}
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
  <div class="whats-next">
    {#if hasCollectableAmount || hasSplittableAmount}
      <div class="card">
        <h4>On transaction confirmation…</h4>
        <ul>
          {#if hasCollectableAmount && hasSplittableAmount}
            <!--
              Something called "Split" before the project was claimed,
              and there's also a splittable amount too.
            -->
            <UlIconLi icon={Download}
              >Some of your claimable funds will be <span class="typo-text-bold"
                >collected directly to your connected wallet</span
              > as shown above.</UlIconLi
            >
            <UlIconLi icon={SplitsIcon}
              >Remaining claimable funds will be <span class="typo-text-bold"
                >immediately split</span
              > as shown above.</UlIconLi
            >
          {:else if hasCollectableAmount}
            <!--
              Something called "Split" before the project was claimed.
            -->
            <UlIconLi icon={SplitsIcon}
              >Claimable funds will be<span class="typo-text-bold"
                >collected directly to your connected wallet</span
              > as shown above.</UlIconLi
            >
          {:else if hasSplittableAmount}
            <!--
              The usual case; no-one has called `split` on the account before it
              being claimed.
            -->
            <UlIconLi icon={SplitsIcon}
              >All claimable funds will be <span class="typo-text-bold"
                >immediately split as shown above</span
              >.</UlIconLi
            >
          {/if}
        </ul>
      </div>
    {/if}
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
            >monthly</span
          >, on the last Thursday of every month.</UlIconLi
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
    text-align: left;
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
