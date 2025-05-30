<script lang="ts">
  import ThumbsDown from "$lib/components/icons/ThumbsDown.svelte";
  import ThumbsUp from "$lib/components/icons/ThumbsUp.svelte";

  export let applicationId: string;
  export let decision: 'approve' | 'reject' | null = null;

  $: checkboxSlugPrefix = `application-decision-${applicationId}`;

  function handleDecisionClick(clickedDecision: 'approve' | 'reject') {
    if (decision === clickedDecision) {
      decision = null;
    } else {
      decision = clickedDecision;
    }
  }
</script>

<div role="group" aria-label="Application decision" class="application-decision-buttons">
  <input type="checkbox" value="reject" checked={decision === 'reject'} id="{checkboxSlugPrefix}-reject" on:click={() => handleDecisionClick('reject')} />
  <label
    class:rejected={decision === 'reject'}
    for="{checkboxSlugPrefix}-reject"
    aria-label="Reject application"
  >
    <ThumbsDown style="fill: var(--color-foreground)"/>
  </label>

  <input type="checkbox" value="approve" checked={decision === 'approve'} id="{checkboxSlugPrefix}-approve" on:click={() => handleDecisionClick('approve')} />
  <label
    class:approved={decision === 'approve'}
    for="{checkboxSlugPrefix}-approve"
    aria-label="Approve application"
  >
    <ThumbsUp style="fill: var(--color-foreground)" />
  </label>
</div>

<style>
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
    transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out;
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
