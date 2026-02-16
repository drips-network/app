<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
</script>

<HeadMeta
  title="Kick off your Wave with a boost"
  description="Earn 100 bonus points by sharing the official 'I'm joining Stellar Wave 1' GIF on social media and participating in Stellar Wave 1."
/>

<div class="page">
  <div class="wrapper">
    <div class="form-container">
      Sorry, but this campaign has ended. Stay tuned for future opportunities!
    </div>
  </div>
</div>

<style>
  .page {
    max-width: calc(100vw + 2rem);
    width: 100vw;
    margin: 0 -1rem;
    padding: 1rem;
    padding-top: 13rem;
    overflow: hidden;
  }

  .wrapper {
    max-width: 47rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 5rem;
  }

  .form-container {
    position: relative;
    max-width: 50rem;
    text-align: center;
    padding: min(4rem, 6vw);
    background-color: var(--color-background);
    border-radius: 2rem 0 2rem 2rem;
    box-shadow: var(--elevation-low);
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
