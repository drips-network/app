<script lang="ts">
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Download from '$lib/components/icons/Download.svelte';
  import downloadUrl from '$lib/utils/download-url';

  export let url = '';
  export let downloadableImageUrl = '';
  export let text = '';

  function downloadImage() {
    const segments = new URL(window.location.origin + downloadableImageUrl + text).pathname.split(
      '/',
    );
    const last = segments.pop() || segments.pop(); // Handle potential trailing slash
    downloadUrl(downloadableImageUrl, last);
  }
</script>

<StepLayout>
  <div class="share-url">
    <div class="downloadable-image">
      <div class="downloadable-image__card">
        <img src={downloadableImageUrl || url} alt="downloadable header" />
      </div>
      <Button on:click={downloadImage} variant="normal" icon={Download}>Download</Button>
    </div>
    <div class="share-options pixelated">
      <h2 class="pixelated">Share</h2>
      <p>Share this project on a network of your choice below.</p>
    </div>
  </div>
</StepLayout>

<style>
  .downloadable-image {
    position: relative;
    margin-bottom: 2rem;
  }

  .downloadable-image__card {
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    background-color: var(--color-background);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow: hidden;
  }

  .downloadable-image :global(button) {
    position: absolute;
    right: 1rem;
    bottom: -1rem;
  }

  .share-options {
    text-align: left;
  }
</style>
