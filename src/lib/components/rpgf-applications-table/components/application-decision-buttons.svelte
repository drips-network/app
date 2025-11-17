<script lang="ts">
  import { createBubbler, stopPropagation } from 'svelte/legacy';

  const bubble = createBubbler();
  import ThumbsDown from '$lib/components/icons/ThumbsDown.svelte';
  import ThumbsUp from '$lib/components/icons/ThumbsUp.svelte';

  interface Props {
    applicationId: string;
    decision?: 'approve' | 'reject' | null;
  }

  let { applicationId, decision = $bindable() }: Props = $props();

  let checkboxSlugPrefix = $derived(`application-decision-${applicationId}`);

  function handleDecisionClick(clickedDecision: 'approve' | 'reject') {
    if (decision === clickedDecision) {
      decision = null;
    } else {
      decision = clickedDecision;
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  role="group"
  aria-label="Application decision"
  class="application-decision-buttons"
  onclick={stopPropagation(bubble('click'))}
>
  <input
    type="checkbox"
    value="reject"
    checked={decision === 'reject'}
    id="{checkboxSlugPrefix}-reject"
    onclick={() => handleDecisionClick('reject')}
  />
  <label
    class:rejected={decision === 'reject'}
    for="{checkboxSlugPrefix}-reject"
    aria-label="Reject application"
  >
    <ThumbsDown style="fill: var(--color-foreground)" />
  </label>

  <input
    type="checkbox"
    value="approve"
    checked={decision === 'approve'}
    id="{checkboxSlugPrefix}-approve"
    onclick={() => handleDecisionClick('approve')}
  />
  <label
    class:approved={decision === 'approve'}
    for="{checkboxSlugPrefix}-approve"
    aria-label="Approve application"
  >
    <ThumbsUp style="fill: var(--color-foreground)" />
  </label>
</div>

<style>
  .application-decision-buttons {
    display: flex;
    gap: 0.5rem;
  }
  input {
    display: none;
  }

  label {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    color: var(--color-background);
    transition:
      background-color 0.2s ease-in-out,
      box-shadow 0.2s ease-in-out,
      opacity 0.2s ease-in-out;
    opacity: 0.5;
  }

  label:hover {
    opacity: 1;
  }

  label.rejected {
    background-color: var(--color-negative);
    box-shadow: var(--elevation-low);
    opacity: 1;
  }

  label.approved {
    background-color: var(--color-positive);
    box-shadow: var(--elevation-low);
    opacity: 1;
  }
</style>
