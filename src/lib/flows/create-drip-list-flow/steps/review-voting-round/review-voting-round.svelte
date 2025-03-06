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
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import DripList from '$lib/components/icons/DripList.svelte';
  import ArrowUp from '$lib/components/icons/ArrowUp.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import Countdown from '$lib/components/countdown/countdown.svelte';
  import unreachable from '$lib/utils/unreachable';
  import formatDate from '$lib/utils/format-date';
  import * as multiplayer from '$lib/utils/multiplayer';
  import assert from '$lib/utils/assert';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
  import WhatsNextSection from '$lib/components/whats-next/whats-next-section.svelte';
  import WhatsNextCard from '$lib/components/whats-next/whats-next-card.svelte';
  import WhatsNextItem from '$lib/components/whats-next/whats-next-item.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  $: formValid = $walletStore.connected;

  function submit() {
    dispatch('await', {
      promise: async (updateAwaitStep) => {
        const { signer, address } = $walletStore;
        assert(signer);

        const timestamp = new Date();

        const collaborators = Object.values($context.votingRoundConfig.collaborators).map((v) =>
          v.type === 'address' ? v.address : unreachable(),
        );

        const signature = await multiplayer.signVotingRound(signer, timestamp, address);

        updateAwaitStep({
          message: 'Creating your collaborative Drip List...',
        });

        const { newVotingRoundId } = await multiplayer.startVotingRound({
          chainId: $walletStore.network.chainId ?? unreachable(),
          signature,
          date: timestamp,
          name: $context.dripList.title,
          description: $context.dripList.description,
          collaborators,
          schedule: {
            voting: {
              endsAt: $context.votingRoundConfig.votingEnds ?? unreachable(),
            },
          },
          publisherAddress: $walletStore.address ?? unreachable(),
          areVotesPrivate: $context.votingRoundConfig.areVotesPrivate,
          allowedReceivers: $context.votingRoundConfig.areRecipientsRestricted
            ? Object.values($context.votingRoundConfig.allowedRecipients).map((v) => {
                switch (v.type) {
                  case 'drip-list':
                    return {
                      type: 'dripList',
                      accountId: v.dripList.account.accountId,
                    };
                  case 'address':
                    return {
                      type: 'address',
                      address: v.address,
                    };
                  case 'project':
                    return {
                      type: 'project',
                      url: v.project.source.url,
                    };
                }
              })
            : undefined,
        });

        $context.newVotingRoundId = newVotingRoundId;

        await invalidateAll();
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

  <FormField title="Allowed recipients">
    {#if $context.votingRoundConfig.areRecipientsRestricted}
      <ListEditor
        items={$context.votingRoundConfig.allowedRecipients}
        weightsMode={false}
        isEditable={false}
      />
    {:else}
      <span class="typo-text" style:color="var(--color-foreground-level-4)">Any recipient</span>
    {/if}
    <svelte:fragment slot="action">
      <Button variant="ghost" icon={Pen} on:click={() => dispatch('goForward', { by: -1 })}
        >Edit</Button
      >
    </svelte:fragment>
  </FormField>

  <WhatsNextSection>
    <WhatsNextCard>
      <svelte:fragment slot="title">Once confirmed…</svelte:fragment>
      <svelte:fragment slot="items">
        <WhatsNextItem icon={Proposals}>
          Collaborators can begin <span class="typo-text-bold"
            >voting on which projects and people should receive what percentage of funds</span
          >.
        </WhatsNextItem>
        <WhatsNextItem icon={DripList}>
          The Drip List will appear on your <span class="typo-text-bold">public profile</span>.
        </WhatsNextItem>
      </svelte:fragment>
    </WhatsNextCard>
    <WhatsNextCard>
      <svelte:fragment slot="title">After the voting period…</svelte:fragment>
      <svelte:fragment slot="items">
        <WhatsNextItem icon={ArrowUp}>
          You can <span class="typo-text-bold">publish the Drip List</span> and begin supporting.
        </WhatsNextItem>
        <WhatsNextItem icon={Pen}>
          <span class="typo-text-bold">Edit your Drip List</span> anytime.
        </WhatsNextItem>
      </svelte:fragment>
    </WhatsNextCard>
  </WhatsNextSection>

  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>

  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={Wallet} variant="primary" on:click={submit}
      >Confirm in wallet</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
