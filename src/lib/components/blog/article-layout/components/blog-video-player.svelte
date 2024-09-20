<script lang="ts">
  import Button from '$lib/components/button/button.svelte';

  export let src: string;

  let consented = false;
</script>

<div class="video-container">
  {#if !consented}
    <div class="consent-modal">
      <div class="inner">
        <p class="typo-text" style:color="var(--color-foreground-level-5)">
          This content is provided by YouTube. By loading the video, you consent to YouTube's Terms
          of Service and Privacy Policy.
        </p>
        <Button on:click={() => (consented = true)}>Load YouTube video</Button>
      </div>
    </div>
  {:else}
    <iframe title="YouTube video" width="100%" height="0" {src} allowfullscreen />
  {/if}
</div>

<style>
  .consent-modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .consent-modal > .inner {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    padding: 1rem;
    max-width: 600px;
  }

  .video-container {
    position: relative;
    padding-bottom: 60.25%; /* 16:9 ratio (9 / 16 * 100) */
    height: 0;
    margin: 2.5rem -2rem;
    width: calc(100% + 4rem);
    overflow: hidden;
    border-radius: 2rem 0 2rem 2rem;
    border: 3px solid #c0c0ff;
  }

  .video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 797px) {
    .video-container {
      width: 100%;
      margin: 2.5rem 0;
    }
  }
</style>
