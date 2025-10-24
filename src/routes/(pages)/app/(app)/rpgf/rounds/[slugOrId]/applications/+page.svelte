<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ThreePaneLayout from './shared/three-pane-layout.svelte';
  import ApplicationsPane from './shared/applications-pane.svelte';
  import EmptyState from '$lib/components/section-skeleton/empty-state.svelte';

  export let data;
  $: round = data.round;
  $: ballotStore = data.ballot;

  $: imageBaseUrl = `/api/share-images/rpgf-round/${encodeURIComponent(round.id)}.png`;
</script>

<HeadMeta
  title="Applications | {round.name}"
  description="Applications for the RetroPGF round '{round.name}'. {round.description ?? ''}"
  image="{imageBaseUrl}?target=og"
  twitterImage="{imageBaseUrl}?target=twitter"
/>

<ThreePaneLayout {...data} pageIsEmpty>
  <svelte:fragment slot="apps">
    <ApplicationsPane {...data} {ballotStore} loggedIn={data.rpgfUserData !== null} />
  </svelte:fragment>

  <div class="empty">
    <EmptyState emoji="👀" headline="" text="Select an application on the left to view details" />
  </div>
</ThreePaneLayout>

<style>
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    view-transition-name: rpgf-applications-pane-empty;
  }
</style>
