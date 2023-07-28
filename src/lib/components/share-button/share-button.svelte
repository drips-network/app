<script lang="ts">
  import { browser } from '$app/environment';
  import LinkIcon from 'radicle-design-system/icons/Link.svelte';
  import ShareIcon from 'radicle-design-system/icons/Sharrow.svelte';
  import CopyIcon from 'radicle-design-system/icons/Copy.svelte';
  import CheckCircle from 'radicle-design-system/icons/CheckCircle.svelte';
  import { fade } from 'svelte/transition';

  export let text: string | undefined = undefined;
  export let url: string;

  let shareSupported = browser && navigator.share;

  function handleClick() {
    if (shareSupported) {
      navigator.share({
        text,
        url,
      });
    } else {
      // Copy URL to clipboard
      navigator.clipboard.writeText(url);

      copySuccess = true;
      setTimeout(() => (copySuccess = false), 1000);
    }
  }

  let hovering = false;
  let copySuccess = false;
</script>

{#if shareSupported}
  <button on:click={handleClick}>
    <ShareIcon />
  </button>
{:else}
  <button
    on:mouseenter={() => (hovering = true)}
    on:focus={() => (hovering = true)}
    on:mouseleave={() => (hovering = false)}
    on:blur={() => (hovering = false)}
    on:click={handleClick}
    class:copy-success={copySuccess}
  >
    {#if copySuccess}
      <div transition:fade={{ duration: 200 }}>
        <CheckCircle style="fill: var(--color-positive)" />
      </div>
    {:else if hovering}
      <div transition:fade={{ duration: 200 }}>
        <CopyIcon style="fill: var(--color-primary-level-6)" />
      </div>
    {:else}
      <div transition:fade={{ duration: 200 }}><LinkIcon /></div>
    {/if}
  </button>
{/if}

<style>
  button {
    height: 2rem;
    width: 2rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 1rem;
  }

  button > * {
    position: absolute;
  }

  button:hover:not(.copy-success),
  button:focus-visible:not(.copy-success) {
    background-color: var(--color-primary-level-1);
  }
</style>
