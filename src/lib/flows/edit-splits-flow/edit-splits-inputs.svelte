<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { getSplitPercent } from '$lib/utils/get-split-percent';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { AddressDriverClient, type SplitsReceiverStruct } from 'radicle-drips';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import InputAddress from '$lib/components/input-address/input-address.svelte';
  import Cross from 'radicle-design-system/icons/Cross.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { EditSplitsFlowState } from './edit-splits-flow-state';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import wallet from '$lib/stores/wallet/wallet.store';

  export let context: Writable<EditSplitsFlowState>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface SplitInput {
    receiver: { value: string; type: string };
    amount: string | number | undefined; // percent and eventually points
  }

  const emptyRow = (): SplitInput => {
    return { receiver: { value: '', type: 'unvalidated' }, amount: undefined };
  };

  let splitsInputs: SplitInput[] = [];
  let validationError: string;

  if ($context.splits.length) {
    // fill-in existing splits?
    $context.splits.forEach(async (s) => {
      const row = emptyRow();
      row.receiver.value = AddressDriverClient.getUserAddress(s.userId);
      row.receiver.type = 'valid';
      row.amount = Number(Number(getSplitPercent(s.weight)));
      splitsInputs = [...splitsInputs, row];
    });
  } else {
    // start empty
    splitsInputs.push(emptyRow());
  }

  function addRow() {
    splitsInputs = [...splitsInputs, emptyRow()];
    // TODO focus into input
  }
  function removeRow(index = 0) {
    splitsInputs.splice(index, 1);
    splitsInputs = splitsInputs;
  }

  $: totalPercent = splitsInputs.reduce((acc, curr) => acc + Number(curr.amount ?? 0), 0);
  $: isValidPercents = totalPercent <= 100;

  $: nonEmptyAddressInputsCount = splitsInputs.filter((r) => r.receiver.value.length).length;

  $: isValidAddresses =
    splitsInputs.filter((row) => row.receiver.value.length && row.receiver.type === 'valid')
      .length === nonEmptyAddressInputsCount;

  $: isValidForm =
    isValidPercents &&
    isValidAddresses &&
    // !splitsInputs.filter((s) => s.receiver.value.length <= 1).length &&
    !splitsInputs.find((s) => Number(s.amount) === 0);

  $: allAddresses = splitsInputs.map((row) => row.receiver.value);

  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const client = await getAddressDriverClient();

          // format splits for submission
          const splits: SplitsReceiverStruct[] = await Promise.all(
            splitsInputs
              .filter((s) => s.receiver && s.amount)
              .map(async (s) => ({
                userId: await client.getUserIdByAddress(s.receiver.value),
                weight: BigInt(Math.floor((Number(s.amount) / 100) * 1000000)),
              })),
          );

          return {
            client,
            splits,
          };
        },
        transactions: (transactContext) => [
          {
            transaction: () => transactContext.client.setSplits(transactContext.splits),
          },
        ],
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader headline="Edit splits" description="Split your incoming funds with others!" />

  <section>
    <div
      class="grid grid-cols-10 gap-2 typo-text-bold text-left"
      style="color: var(--color-foreground)"
    >
      <div class="col-span-8">Recipients</div>
      <div class="hidden md:block">Percents</div>
    </div>
    {#each splitsInputs as splitInput, index}
      <div class="splits-input-row md:grid grid-cols-10 gap-2 my-4 md:my-3 items-start">
        <!-- address input -->
        <div class="col-span-6 md:col-span-8">
          <label class="sr-only" for="control">Recipient</label>
          <InputAddress
            bind:value={splitInput.receiver.value}
            on:validationChange={(e) => {
              splitInput.receiver.type = e.detail.type;
            }}
            exclude={[
              {
                addresses: allAddresses.filter((_, i) => i !== index),
                msg: 'Duplicate recipient.',
              },
              {
                addresses: [$wallet.address],
                msg: "You can't split to yourself.",
              },
            ]}
          />
        </div>

        <!-- percent input -->
        <div class="mt-1.5 md:mt-0 col-span-4 md:col-span-2 flex gap-2 items-center">
          <div class="flex-1 text-right">
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
    <div class="mt-3 flex justify-start">
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
          {totalPercent > 0 && totalPercent < 0.01
            ? '>99.99'
            : Math.max(100 - totalPercent, 0)
                .toFixed(2)
                .replace('.00', '')}%
        </div>
      </div>
      <!-- splits total share -->
      <div
        class="h-10 overflow-hidden flex items-center justify-end rounded-md transition-all duration-200"
        style="background: {totalPercent > 100
          ? 'var(--color-negative)'
          : 'var(--color-primary)'}; flex-basis: {Math.max(0, Math.min(totalPercent, 100))}%;"
      >
        <div hidden={totalPercent < 11} class="px-2.5">
          {totalPercent.toFixed(2).replace('.00', '')}%
        </div>
      </div>
    </div>
    <!-- bar labels -->
    <div class="mt-1.5 px-1.5 flex justify-between typo-text-bold">
      <div style:opacity={totalPercent >= 100 ? '0.4' : '1'}>You</div>
      <div style:opacity={totalPercent <= 0 ? '0' : '1'}>
        {nonEmptyAddressInputsCount} account{nonEmptyAddressInputsCount === 1 ? '' : 's'}
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

  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')}>Cancel</Button>
    <Button variant="primary" disabled={!isValidForm} on:click={submit}>Confirm</Button>
  </svelte:fragment>
</StepLayout>
