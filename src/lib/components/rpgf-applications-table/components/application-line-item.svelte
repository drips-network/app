<script lang="ts">
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';
  import type { Application, InProgressBallot } from '$lib/utils/rpgf/schemas';
  import type { ComponentProps } from 'svelte';
  import ApplicationDecisionButtons from './application-decision-buttons.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import type { Writable } from 'svelte/store';

  export let roundSlug: string;
  export let application: Application;

  export let reviewMode: boolean;
  export let decision: ComponentProps<ApplicationDecisionButtons>['decision'] = null;

  export let voteMode: 'build-ballot' | 'assign-votes' | null = null;
  export let ballotStore: Writable<InProgressBallot>;

  let picked = $ballotStore[application.id] !== undefined;

  function updateBallot(picked: boolean) {
    if (picked) {
      ballotStore.update((store) => ({
        ...store,
        [application.id]: null,
      }));
    } else {
      ballotStore.update((store) => {
        const updatedBallot = { ...store };
        delete updatedBallot[application.id];
        return updatedBallot;
      });
    }
  }
  $: updateBallot(picked);

</script>

<div class="application-line-item">
  <a href="/app/rpgf/rounds/{roundSlug}/applications/{application.id}">
    <RpgfApplicationBadge {application} />
  </a>

  {#if reviewMode && application.state === 'pending'}
    <ApplicationDecisionButtons applicationId={application.id} bind:decision />
  {/if}

  {#if voteMode === 'build-ballot' && application.state === 'approved'}
    <Checkbox bind:checked={picked} />
  {/if}
</div>

<style>
  .application-line-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
  }

  .application-line-item:last-child {
    border-bottom: none;
  }
</style>
