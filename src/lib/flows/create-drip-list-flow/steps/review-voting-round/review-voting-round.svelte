<script lang="ts">
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ArrowLeftIcon from '$lib/components/icons/ArrowLeft.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../create-drip-list-flow';
  import Pen from '$lib/components/icons/Pen.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import UlIconLi from '$lib/components/ul-icon-li/ul-icon-li.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import ArrowUp from '$lib/components/icons/ArrowUp.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import Countdown from '$lib/components/countdown/countdown.svelte';
  import unreachable from '$lib/utils/unreachable';
  import formatDate from '$lib/utils/format-date';
  import * as multiplayer from '$lib/utils/multiplayer';
  import assert from '$lib/utils/assert';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: formValid = $walletStore.connected;

  function submit() {
    dispatch('await', {
      promise: async (updateAwaitStep) => {
        const { signer, address } = $walletStore;
        assert(signer);

        const timestamp = new Date();

        const signature = await multiplayer.signVotingRound(
          signer,
          timestamp,
          address,
          Object.keys($context.votingRoundConfig.collaborators),
        );

        updateAwaitStep({
          message: 'Creating your collaborative Drip List...',
        });

        const { newVotingRoundId } = await multiplayer.startVotingRound({
          signature,
          date: timestamp,
          name: $context.dripList.title,
          description: $context.dripList.description,
          collaborators: Object.keys($context.votingRoundConfig.collaborators),
          endsAt: $context.votingRoundConfig.votingEnds ?? unreachable(),
          publisherAddress: $walletStore.address ?? unreachable(),
          privateVotes: $context.votingRoundConfig.privateVotes,
        });

        $context.newVotingRoundId = newVotingRoundId;
      },
      message: 'Confirm in your wallet...',
    });
  }
</script>

<StandaloneFlowStepLayout
  headline="Review voting round"
  description="The wallet you connect will own the Drip List, and be able to edit it in the future."
>
  <FormField title="Name">
    <span class="typo-text">{$context.dripList.title}</span>
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={Pen} on:click={() => dispatch('goForward', { by: -7 })}
        >Edit</Button
      >
    </svelte:fragment>
  </FormField>

  <FormField title="Description">
    {#if !$context.dripList.description}
      <span class="typo-text" style:color="var(--color-foreground-level-4)">No description</span>
    {:else}
      <span class="typo-text">{$context.dripList.description}</span>
    {/if}
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={Pen} on:click={() => dispatch('goForward', { by: -7 })}
        >Edit</Button
      >
    </svelte:fragment>
  </FormField>

  <FormField title="Collaborators">
    <ListEditor
      items={$context.votingRoundConfig.collaborators}
      weightsMode={false}
      isEditable={false}
    />
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={Pen} on:click={() => dispatch('goForward', { by: -1 })}
        >Edit</Button
      >
    </svelte:fragment>
  </FormField>

  <FormField title="Voting ends">
    <p style:margin-bottom="0.25rem" class="typo-text tabular-nums">
      <Countdown targetDate={$context.votingRoundConfig.votingEnds ?? unreachable()} />
    </p>
    <p class="typo-text-small">
      That's {formatDate($context.votingRoundConfig.votingEnds ?? unreachable(), 'verbose')} your time.
    </p>
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={Pen} on:click={() => dispatch('goForward', { by: -1 })}
        >Edit</Button
      >
    </svelte:fragment>
  </FormField>

  <div class="whats-next text-left">
    <div class="card">
      <h4>Once confirmed…</h4>
      <ul>
        <UlIconLi icon={Proposals}
          >Collaborators can begin <span class="typo-text-bold"
            >voting on which projects and people should receive what percentage of funds</span
          >.</UlIconLi
        >
        <UlIconLi icon={DripList}
          >The Drip List will appear on your <span class="typo-text-bold">public profile</span
          >.</UlIconLi
        >
      </ul>
    </div>
    <div class="card">
      <h4>After the voting period…</h4>
      <ul>
        <UlIconLi icon={ArrowUp}
          >You can <span class="typo-text-bold">publish the Drip List</span> and begin supporting.</UlIconLi
        >
        <UlIconLi icon={Proposals}
          >Start <span class="typo-text-bold">another voting round</span> to update recipients anytime.</UlIconLi
        >
        <UlIconLi icon={Pen}
          ><span class="typo-text-bold">Edit your Drip List</span> anytime.</UlIconLi
        >
      </ul>
    </div>
  </div>

  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>

  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={Wallet} variant="primary" on:click={submit}
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
</style>
