<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { DripListItem, Items } from '$lib/components/list-editor/types';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import network from '$lib/stores/wallet/network';
  import { linkDripListsToRound } from '$lib/utils/rpgf/rpgf';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let linkedDripLists: DripListItem['dripList'][];
  export let roundSlug: string;

  let items: Items = Object.fromEntries(
    linkedDripLists.map((dripList) => [
      dripList.account.accountId,
      {
        type: 'drip-list',
        dripList,
      },
    ]),
  );

  function handleSubmit() {
    dispatch('await', {
      message: 'Updating linked Drip Lists…',
      promise: async () => {
        await linkDripListsToRound(undefined, roundSlug, Object.keys(items));
        await invalidateAll();

        await goto(`/app/rpgf/rounds/${roundSlug}#distribution`);

        modal.hide();
      },
    });
  }
</script>

<StandaloneFlowStepLayout>
  <StepHeader
    emoji="✏️"
    headline="Edit linked Drip Lists"
    description={`
      Choose which Drip Lists should appear as linked with this RPGF round.
      Linked lists appear publicly on the round view. You can paste any Drip List URL on ${network.label} into the list below.
    `}
  />

  <FormField type="div" title="Linked Drip Lists">
    <ListEditor bind:items weightsMode={false} allowProjects={false} allowAddresses={false} />
  </FormField>

  <svelte:fragment slot="actions">
    <Button variant="primary" on:click={handleSubmit} icon={CheckCircle}>
      Update linked Drip Lists
    </Button>
  </svelte:fragment>
</StandaloneFlowStepLayout>
