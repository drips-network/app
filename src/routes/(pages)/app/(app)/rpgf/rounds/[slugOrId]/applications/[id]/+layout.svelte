<script>
  import ApplicationsPane from '../shared/applications-pane.svelte';
  import ThreePaneLayout from '../shared/three-pane-layout.svelte';

  export let data;
</script>

<ThreePaneLayout {...data}>
  <svelte:fragment slot="apps">
    <ApplicationsPane {...data} ballotStore={data.ballot} loggedIn={data.rpgfUserData !== null} />
  </svelte:fragment>

  <slot />
</ThreePaneLayout>
