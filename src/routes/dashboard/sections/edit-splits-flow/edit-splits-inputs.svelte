<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { getSplitPercent } from '$lib/utils/get-split-percent';
  import type { SplitsEntry } from '$lib/stores/splits/types';
  import type { UserId } from '$lib/stores/streams/types';
  import { getAddressDriverClient, getSubgraphClient } from '$lib/utils/get-drips-clients';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import { AddressDriverClient, type AddressDriver } from 'radicle-drips';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import InputAddress from '$lib/components/input-address/input-address.svelte';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import type { StepComponentEvents, UpdateAwaitStepFn } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import etherscanLink from '$lib/utils/etherscan-link';
  import wallet from '$lib/stores/wallet';
  import { createEventDispatcher } from 'svelte';
  import Emoji from 'radicle-design-system/Emoji.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface SplitInput {
    receiver: { value: string; type: string };
    amount: string | number | undefined; // percent and eventually points
  }

  const emptyRow = (): SplitInput => {
    return { receiver: { value: '', type: 'unvalidated' }, amount: undefined };
  };

  let userId: string;
  let splitsInputs: SplitInput[] = [emptyRow(), emptyRow()];
  let currentSplits: SplitsEntry[] | undefined;
  let loadingError = false;
  let validationError: string;

  const init = async () => {
    const client = await getAddressDriverClient();
    userId = (await client.getUserId()).toString();
    return getCurrentSplits(userId);
  };

  async function getCurrentSplits(userId: UserId) {
    currentSplits = undefined;
    loadingError = false;

    try {
      const subgraphClient = getSubgraphClient();
      currentSplits = await subgraphClient.getSplitsConfigByUserId(userId);

      if (currentSplits.length) {
        splitsInputs = [];
        // format each split as input row...
        currentSplits.forEach(async (s) => {
          const row = emptyRow();
          row.receiver.value = AddressDriverClient.getUserAddress(s.userId);
          row.receiver.type = 'valid';
          row.amount = Number(Number(getSplitPercent(s.weight)).toFixed(2));
          splitsInputs = [...splitsInputs, row];
        });

        isValidAddresses = true;
      }
      return true;
    } catch (e) {
      loadingError = true;
    }
  }

  function addRow() {
    splitsInputs = [...splitsInputs, emptyRow()];
    // TODO focus into input
  }
  function removeRow(index = 0) {
    splitsInputs = splitsInputs.filter((s, i) => i !== index);
  }

  $: totalPercent = splitsInputs.reduce((acc, curr) => acc + Number(curr.amount ?? 0), 0);
  $: isValidPercents = totalPercent <= 100;

  $: isValidAddresses =
    splitsInputs.filter((row) => row.receiver.type === 'valid').length === splitsInputs.length;

  $: isValidForm =
    isValidPercents &&
    isValidAddresses &&
    !splitsInputs.filter((s) => s.receiver.value.length <= 1).length &&
    !splitsInputs.find((s) => Number(s.amount) === 0);

  $: allAddresses = splitsInputs.map((row) => row.receiver.value);

  function submit() {
    const promise = async (updateAwaitStep: UpdateAwaitStepFn) => {
      modal.setHideable(false);
      const client = await getAddressDriverClient();

      // format splits for submission
      const splits: AddressDriver.SplitsReceiverStruct[] = await Promise.all(
        splitsInputs
          .filter((s) => s.receiver && s.amount)
          .map(async (s) => ({
            userId: await client.getUserIdByAddress(s.receiver.value),
            weight: BigInt(Math.floor((Number(s.amount) / 100) * 1000000)),
          })),
      );

      const waitingWalletIcon = {
        component: Emoji,
        props: { emoji: '👛', size: 'huge' },
      };

      updateAwaitStep({
        icon: waitingWalletIcon,
        message: 'Waiting for you to confirm the transaction in your wallet',
      });

      const tx = await client.setSplits(splits);

      updateAwaitStep({
        message: 'Waiting for transaction to be confirmed…',
        link: {
          label: 'View on Etherscan',
          url: etherscanLink($wallet.network.name, tx.hash),
        },
      });

      await tx.wait();

      modal.setHideable(true);
    };

    dispatch('await', {
      message: 'Preparing to submit...',
      promise,
    });
  }
</script>

<StepLayout>
  <StepHeader headline="Edit splits" description="Split your incoming funds with others!" />

  {#await init()}
    <div class="h-32 flex items-center justify-center">
      <Spinner />
    </div>
  {:then}
    <section>
      <div
        class="grid grid-cols-10 gap-2 typo-text-bold text-left"
        style="color: var(--color-foreground-level-6)"
      >
        <div class="col-span-8">Recipient*</div>
        <div>Percent*</div>
      </div>
      {#each splitsInputs as splitInput, index}
        <div class="grid grid-cols-10 gap-2 my-3 items-start">
          <!-- address input -->
          <div class="col-span-8">
            <label class="sr-only" for="control">Recipient</label>
            <InputAddress
              bind:value={splitInput.receiver.value}
              on:validationChange={(e) => {
                splitInput.receiver.type = e.detail.type;
              }}
              exclude={{
                addresses: allAddresses.filter((r, i) => i !== index),
                msg: 'Duplicate recipient.',
              }}
            />
          </div>
          <!-- percent input -->
          <div class="col-span-2 flex gap-2 items-center">
            <div class="flex-1">
              <label class="sr-only" for="control">Percent</label>
              <!-- TODO add max attribute to design system :( -->
              <TextInput
                variant={{ type: 'number', min: 0 }}
                bind:value={splitInput.amount}
                placeholder="%"
              />
            </div>
            <!-- remove row btn -->
            <div>
              <Button on:click={() => removeRow(index)} icon={Cross} />
            </div>
          </div>
        </div>
      {/each}
      <div class="mt-3">
        <Button on:click={addRow} icon={Plus}>Add recipient</Button>
      </div>
    </section>

    <section>
      <h6 class="typo-text-bold text-left mb-3" style="color:var(--color-foreground-level-6)">
        Review
      </h6>
      <!-- animating bar -->
      <div class="flex w-full gap-[3.5px]">
        <!-- your share -->
        <div
          class="h-10 overflow-hidden flex items-center justify-start rounded-md transition-all duration-200"
          style="background: var(--color-primary-level-2); flex-basis: {Math.max(
            100 - totalPercent,
            0,
          )}%;"
        >
          <div hidden={100 - totalPercent < 11} class="px-2.5">
            {Math.max(100 - totalPercent, 0)
              .toFixed(2)
              .replace('.00', '')}%
          </div>
        </div>
        <!-- splits total share -->
        <div
          class="h-10 overflow-hidden flex items-center justify-end rounded-md transition-all duration-200"
          style="background: {totalPercent > 100
            ? 'var(--color-negative)'
            : 'var(--color-primary)'}; flex-basis: {Math.min(totalPercent, 100)}%;"
        >
          <div hidden={totalPercent < 11} class="px-2.5">
            {totalPercent.toFixed(2).replace('.00', '')}%
          </div>
        </div>
      </div>
      <!-- bar labels -->
      <div class="mt-1.5 px-1.5 flex justify-between typo-text-bold">
        <div style:opacity={totalPercent >= 100 ? '0.4' : '1'}>You</div>
        <div style:opacity={totalPercent <= 0 ? '0.4' : '1'}>
          {splitsInputs.length} account{splitsInputs.length > 1 ? 's' : ''}
        </div>
      </div>
      <!-- error msgs -->
      {#if validationError || !isValidPercents}
        <div class="mt-1" style="color: var(--color-negative);">
          {#if !isValidPercents}<div>Total percent cannot exceed 100%.</div>{/if}
          {#if validationError}<div>{validationError}</div>{/if}
        </div>
      {/if}
    </section>
  {/await}

  <svelte:fragment slot="actions">
    <Button disabled={!isValidForm} on:click={submit}>Confirm</Button>
  </svelte:fragment>
</StepLayout>
