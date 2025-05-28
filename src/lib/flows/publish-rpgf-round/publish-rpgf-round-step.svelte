<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import { createEventDispatcher } from 'svelte';
  import { publishRound } from '$lib/utils/rpgf/rpgf';
  import { goto } from '$app/navigation';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let draftId: string;

  async function handleConfirm() {
    dispatch('await', {
      promise: async () => {
        const roundWrapper = await publishRound(undefined, draftId);

        await goto(`/app/rpgf/rounds/${roundWrapper.round.urlSlug}`);
      },
      message: 'Publishing round...',
    });
  }
</script>

<StepLayout>
  <StepHeader
    headline="Publish your round"
    description="Are you sure you want to publish your round and make it public?"
    emoji="🌐"
  />
  <AnnotationBox type="warning">
    After publishing, you will no longer be able to edit the round's URL or schedule.
  </AnnotationBox>
  <svelte:fragment slot="actions">
    <Button on:click={() => modal.hide()} variant="ghost">Cancel</Button>
    <Button on:click={handleConfirm} variant="primary">Publish round</Button>
  </svelte:fragment>
</StepLayout>
