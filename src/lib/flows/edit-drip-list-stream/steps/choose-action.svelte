<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import { makeStep, type StepComponentEvents } from '$lib/components/stepper/types';
  import modal from '$lib/stores/modal';
  import ChevronRight from 'radicle-design-system/icons/ChevronRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import EnterNewValues from './edit-stream/enter-new-values.svelte';
  import DeleteStream from './delete-stream/delete-stream.svelte';
  import SuccessStep from '$lib/components/success-step/success-step.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let dripListId: string;

  function triggerEditFlow() {
    dispatch('sidestep', {
      steps: [
        makeStep({
          component: EnterNewValues,
          props: { dripListId },
        }),
        makeStep({
          component: SuccessStep,
          props: {
            message:
              'Your new stream rate has successfully been updated. Please refresh the app to see your changes.',
            action: 'hide-modal',
          },
        }),
      ],
    });
  }

  function triggerDeleteFlow() {
    dispatch('sidestep', {
      steps: [
        makeStep({
          component: DeleteStream,
          props: { dripListId },
        }),
        makeStep({
          component: SuccessStep,
          props: {
            message:
              'Your support stream has successfully been deleted. Please refresh the app to see your changes.',
            action: 'hide-modal',
          },
        }),
      ],
    });
  }
</script>

<StepLayout>
  <StepHeader
    emoji="✏️"
    headline="Edit Support Stream"
    description="Change your stream rate & token, or stop supporting."
  />
  <div class="options">
    <button class="option" on:click={triggerEditFlow}>
      <div class="label">
        <h4>Edit stream rate</h4>
        <p>Change the monthly support amount</p>
      </div>
      <ChevronRight />
    </button>
    <button class="option" on:click={triggerDeleteFlow}>
      <div class="label">
        <h4>Stop stream</h4>
        <p>Stop supporting your Drip List</p>
      </div>
      <ChevronRight />
    </button>
  </div>
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide}>Cancel</Button>
  </svelte:fragment>
</StepLayout>

<style>
  .options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .options .option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 1.25rem 0 1.25rem 1.25rem;
    box-shadow: var(--elevation-low);
    transition: background-color 0.3s;
  }

  .options .option:hover,
  .options .option:focus-visible {
    background-color: var(--color-foreground-level-1);
  }

  .options .option .label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: baseline;
  }

  .options .option .label p {
    color: var(--color-foreground-level-6);
  }
</style>
