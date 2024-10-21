<script lang="ts">
  import { browser } from '$app/environment';
  import ShareIcon from '$lib/components/icons/Sharrow.svelte';
  import Button from '../button/button.svelte';
  import { onMount, type ComponentProps } from 'svelte';
  import modal from '$lib/stores/modal';
  import shareSteps from '$lib/flows/share/share-steps';
  import Stepper from '$lib/components/stepper/stepper.svelte';

  export let text: string | undefined = undefined;
  export let url: string;
  export let downloadableImageUrl: string = '';
  export let shareModalText: string | undefined = undefined;
  export let buttonVariant: ComponentProps<Button>['variant'] = 'ghost';

  export let shareLabel = 'Share';

  let shareSupported = browser && navigator.share;
  let isTouchDevice = browser && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  async function preloadImage(url: string) {
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
    } catch (error) {
      // we don't really care to make a big fuss about this
      // eslint-disable-next-line no-console
      console.error('Error preloading image', error);
    }
  }

  function handleClick() {
    if (isTouchDevice && shareSupported) {
      navigator.share({
        text,
        url,
      });

      return;
    }

    modal.show(
      Stepper,
      undefined,
      shareSteps({
        text,
        url,
        downloadableImageUrl,
        shareModalText,
      }),
    );
  }

  onMount(() => {
    if (downloadableImageUrl) {
      preloadImage(downloadableImageUrl);
    }
  });
</script>

<Button variant={buttonVariant} on:click={handleClick}>
  <div class="button-inner">
    <ShareIcon style="fill:currentColor" />
    {shareLabel}
  </div>
</Button>

<style>
  .button-inner {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    margin-left: -0.25rem;
  }
</style>
