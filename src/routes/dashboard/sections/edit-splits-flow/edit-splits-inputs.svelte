<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { getSplitPercent } from '$lib/stores/splits/methods/get-split-percent';
  import type { SplitsEntry } from '$lib/stores/splits/types';
  import type { UserId } from '$lib/stores/streams/types';
  import { getAddressDriverClient, getSubgraphClient } from '$lib/utils/get-drips-clients';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import { AddressDriverClient } from 'radicle-drips';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';

  interface SplitInput {
    receiver: string;
    amount: number | undefined; // percent and eventually points
  }

  const emptyRow = (): SplitInput => {
    return { receiver: '', amount: undefined };
  };

  let userId: string;
  let splits: SplitInput[] = [emptyRow(), emptyRow()];
  let currentSplits: SplitsEntry[] | undefined;
  let loadingError = false;

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
        splits = [];
        // format each split as input row...
        currentSplits.forEach(async (s) => {
          const row = emptyRow();
          row.receiver = AddressDriverClient.getUserAddress(s.userId);
          row.amount = Number(Number(getSplitPercent(s.weight)).toFixed(2)) * 100;
          splits = [...splits, row];
        });
      }
      return true;
    } catch (e) {
      loadingError = true;
    }
  }

  function addRow() {
    splits = [...splits, emptyRow()];
  }
</script>

<StepLayout>
  <StepHeader headline="Edit splits" description="Split your incoming funds with others!" />

  {#await init()}
    <div class="h-32 flex items-center justify-center">
      <Spinner />
    </div>
  {:then}
    {#each splits as split}
      <div class="grid grid-cols-5 gap-2">
        <div class="col-span-4">
          <FormField title="Recipient*">
            <!-- TODO - validate like create stream input-->
            <TextInput bind:value={split.receiver} placeholder="ENS name or ETH address" />
          </FormField>
        </div>
        <FormField title="Percent">
          <!-- TODO add max attribute to design system :( -->
          <TextInput
            variant={{ type: 'number', min: 0 }}
            bind:value={split.amount}
            placeholder="%"
          />
        </FormField>
      </div>
    {/each}
    <div>
      <Button on:click={addRow} icon={Plus}>Add</Button>
    </div>
  {/await}

  <svelte:fragment slot="actions">
    <Button>Confirm</Button>
  </svelte:fragment>
</StepLayout>
